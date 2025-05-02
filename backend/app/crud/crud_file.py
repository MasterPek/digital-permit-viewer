from fastapi import File, UploadFile, HTTPException, status
from fastapi.responses import JSONResponse
from core.config import settings
from sqlalchemy.ext.asyncio import AsyncSession
from db.models import File as FileModel
from schemas.file import FileResponse
import os
from datetime import datetime
from PyPDF2 import PdfReader, PdfWriter

async def uploadReport(
    db: AsyncSession,
    files: list[UploadFile] = File(...),
):
    # Validate at least two files are provided
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least two PDF files are required for merging.")

    # Generate timestamp-based filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")  # Example: 20250305_153000
    
    # Create directory for reports if it doesn't exist
    report_dir = f"{settings.FILE_DIR}/reports"
    os.makedirs(report_dir, exist_ok=True)
    
    # Initialize a PdfWriter for the merged output
    output_pdf = PdfWriter()
    
    # List to keep track of temporary file paths
    temp_file_paths = []
    
    # Process each uploaded file
    for i, file in enumerate(files):
        # Validate file type
        if not file.content_type == "application/pdf":
            raise HTTPException(status_code=400, detail=f"File {i+1} is not a PDF. Only PDF files are allowed.")
        
        # Validate file size (e.g., limit to 10MB)
        max_file_size = 10 * 1024 * 1024  # 10MB
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)
        if file_size > max_file_size:
            raise HTTPException(status_code=400, detail=f"File {i+1} exceeds the 10MB limit.")
        
        # Save the uploaded PDF to a directory
        temp_file_path = os.path.join(report_dir, f"temp_{i}_{file.filename}")
        with open(temp_file_path, "wb") as buffer:
            buffer.write(await file.read())
        
        temp_file_paths.append(temp_file_path)
        
        # Add all pages from this PDF to the output
        try:
            pdf = PdfReader(temp_file_path)
            for page in pdf.pages:
                output_pdf.add_page(page)
        except Exception as e:
            # Clean up temporary files in case of error
            for path in temp_file_paths:
                if os.path.exists(path):
                    os.remove(path)
            raise HTTPException(status_code=400, detail=f"Error processing file {i+1}: {str(e)}")
    
    # Create merged PDF file
    merged_filename = f"merged_report_{timestamp}.pdf"
    merged_file_path = os.path.join(report_dir, merged_filename)
    
    with open(merged_file_path, "wb") as output_file:
        output_pdf.write(output_file)
    
    # Clean up temporary files
    for path in temp_file_paths:
        if os.path.exists(path):
            os.remove(path)
    
    # Save file metadata to the database
    try:
        data = FileModel(
            filename=merged_filename,
            file_path=f"digital-permit-storage/reports/{merged_filename}",
            mime_type="application/pdf",
            size=os.path.getsize(merged_file_path),
        )
        db.add(data)
        await db.commit()
        await db.refresh(data)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
    return JSONResponse(
        status_code=201,
        content={
            "detail": "Files merged successfully",
            "data": FileResponse.model_validate(data).model_dump(),
        },
    )