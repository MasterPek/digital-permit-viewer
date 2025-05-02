from fastapi import HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import func
from schemas.permit import PointSchema
from db.models import DigitalPermitPoint
from geoalchemy2 import WKTElement
from geoalchemy2.shape import to_shape
from utils.item import make_naive
from datetime import datetime, timezone

async def getPoints(db: AsyncSession):  
  result = await db.execute(select(DigitalPermitPoint))
  data = result.scalars().all()
  for obj in data:
    if isinstance(obj.shape, str):
      obj.shape = WKTElement(obj.shape)
    obj.shape = to_shape(obj.shape).wkt
  return data

async def createPoint(db: AsyncSession, point_data: PointSchema):
  query_globalid = await db.execute(select(DigitalPermitPoint).filter_by(globalid=point_data.globalid))
  existing_globalid = query_globalid.scalar_one_or_none()

  if existing_globalid:
    raise HTTPException(status_code=400, detail="globalid already exists!")
  
  data = DigitalPermitPoint(
        globalid=point_data.globalid,
        formid=point_data.formid,
        templateid=point_data.templateid,
        projectid=point_data.projectid,
        approval_status=point_data.approval_status,
        start_datetime=point_data.start_datetime,
        end_datetime=point_data.end_datetime,
        # created_by=point_data.created_by,
        # updated_by=point_data.updated_by,
        shape=WKTElement(point_data.shape, srid=3857)
    )
  db.add(data)
  await db.commit()
  await db.refresh(data)
  
  # Convert shape to WKT for JSON response
  converted_shape = to_shape(data.shape).wkt if data.shape else None

  return JSONResponse(
        status_code=201,
        content={
            "detail": "Point shape created successfully",
            "data": {
                "objectid": data.objectid,
                "globalid": data.globalid,
                "formid": data.formid,
                "templateid": data.templateid,
                "projectid": data.projectid,
                "approval_status": data.approval_status,
                "start_datetime": data.start_datetime.isoformat() if data.start_datetime else None,
                "end_datetime": data.end_datetime.isoformat() if data.end_datetime else None,
                "created_at": data.created_at.isoformat() if data.created_at else None,
                "updated_at": data.updated_at.isoformat() if data.updated_at else None,
                "shape": converted_shape
            }
        })

async def getPointById(db: AsyncSession, objectid: int):
  # Define the query using select
    stmt = (
        select(
            DigitalPermitPoint,
            func.ST_AsText(DigitalPermitPoint.shape).label("shape_wkt")
        )
        .where(DigitalPermitPoint.objectid == objectid)
    )

    # Execute the query
    result = await db.execute(stmt)
    object_id = result.first()

    # Check if the result is empty
    if not object_id:
        raise HTTPException(status_code=404, detail="Permit Point not found")

    # Extract the object_id and its WKT representation
    data, shape_wkt = object_id

    # Assign the WKT representation to the shape attribute
    data.shape = shape_wkt

    return data

async def updatePoint(db: AsyncSession, objectid: int, point_data: PointSchema):
    data = await getPointById(db, objectid)
    data.globalid = point_data.globalid
    data.formid = point_data.formid
    data.templateid = point_data.templateid
    data.projectid = point_data.projectid
    data.approval_status = point_data.approval_status
    data.start_datetime = make_naive(point_data.start_datetime)
    data.end_datetime = make_naive(point_data.end_datetime)
    data.updated_at = make_naive(datetime.now(timezone.utc))  # Proper timezone handling
    data.shape = WKTElement(point_data.shape, srid=3857)

    await db.commit()
    await db.refresh(data)

    # Convert shape to WKT for JSON response
    converted_shape = to_shape(data.shape).wkt if data.shape else None
    
    return JSONResponse(
        status_code=200,
        content={
            "detail": "Point shape updated successfully",
            "data": {
                "objectid": data.objectid,
                "globalid": data.globalid,
                "formid": data.formid,
                "templateid": data.templateid,
                "projectid": data.projectid,
                "approval_status": data.approval_status,
                "start_datetime": data.start_datetime.isoformat() if data.start_datetime else None,
                "end_datetime": data.end_datetime.isoformat() if data.start_datetime else None,
                "updated_at": data.updated_at.isoformat() if data.start_datetime else None,
                "shape": converted_shape
            }
        }
    )