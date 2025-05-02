from fastapi import HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import func
from schemas.permit import PolygonSchema
from db.models import DigitalPermitPolygon
from geoalchemy2 import WKTElement
from geoalchemy2.shape import to_shape
from utils.item import make_naive
from datetime import datetime, timezone

async def getPolygons(db: AsyncSession):
  result = await db.execute(select(DigitalPermitPolygon))
  data = result.scalars().all()
  for obj in data:
    if isinstance(obj.shape, str):
      obj.shape = WKTElement(obj.shape)
    obj.shape = to_shape(obj.shape).wkt
  return data

async def createPolygon(db: AsyncSession, polygon_data: PolygonSchema):
  query_globalid = await db.execute(select(DigitalPermitPolygon).filter_by(globalid=polygon_data.globalid))
  existing_globalid = query_globalid.scalar_one_or_none()

  if existing_globalid:
    raise HTTPException(status_code=400, detail="globalid already exists!")
  
  data = DigitalPermitPolygon(
        globalid=polygon_data.globalid,
        formid=polygon_data.formid,
        templateid=polygon_data.templateid,
        projectid=polygon_data.projectid,
        approval_status=polygon_data.approval_status,
        start_datetime=polygon_data.start_datetime,
        end_datetime=polygon_data.end_datetime,
        # created_by=polygon_data.created_by,
        # updated_by=polygon_data.updated_by,
        shape=WKTElement(polygon_data.shape, srid=3857)
    )
  db.add(data)
  await db.commit()
  await db.refresh(data)
  
  # Convert shape to WKT for JSON response
  converted_shape = to_shape(data.shape).wkt if data.shape else None

  return JSONResponse(
        status_code=201,
        content={
            "detail": "Polygon shape created successfully",
            "data": {
                "objectid": data.objectid,
                "globalid": data.globalid,
                "formid": data.formid,
                "templateid": data.templateid,
                "projectid": data.projectid,
                "approval_status": data.approval_status,
                "start_datetime": data.start_datetime,
                "end_datetime": data.end_datetime,
                "updated_at": data.updated_at,
                "shape": converted_shape
            }
        },
    )

async def getPolygonById(db: AsyncSession, objectid: int):
  # Define the query using select
    stmt = (
        select(
            DigitalPermitPolygon,
            func.ST_AsText(DigitalPermitPolygon.shape).label("shape_wkt")
        )
        .where(DigitalPermitPolygon.objectid == objectid)
    )

    # Execute the query
    result = await db.execute(stmt)
    object_id = result.first()

    # Check if the result is empty
    if not object_id:
        raise HTTPException(status_code=404, detail="Permit Polygon not found")

    # Extract the object_id and its WKT representation
    data, shape_wkt = object_id

    # Assign the WKT representation to the shape attribute
    data.shape = shape_wkt

    return data

async def updatePolygon(db: AsyncSession, objectid: int, polygon_data: PolygonSchema):
    data = await getPolygonById(db, objectid)
    data.globalid = polygon_data.globalid
    data.formid = polygon_data.formid
    data.templateid = polygon_data.templateid
    data.projectid = polygon_data.projectid
    data.approval_status = polygon_data.approval_status
    data.start_datetime = make_naive(polygon_data.start_datetime)
    data.end_datetime = make_naive(polygon_data.end_datetime)
    data.updated_at = make_naive(datetime.now(timezone.utc))  # Proper timezone handling
    data.shape = WKTElement(polygon_data.shape, srid=3857)

    await db.commit()
    await db.refresh(data)

    # Convert shape to WKT for JSON response
    converted_shape = await db.scalar(func.ST_AsText(data.shape))
    
    return JSONResponse(
        status_code=200,
        content={
            "detail": "Polygon shape updated successfully",
            "data": {
                "objectid": data.objectid,
                "globalid": data.globalid,
                "formid": data.formid,
                "templateid": data.templateid,
                "projectid": data.projectid,
                "approval_status": data.approval_status,
                "start_datetime": data.start_datetime,
                "end_datetime": data.end_datetime,
                "updated_at": data.updated_at,
                "shape": converted_shape
            }
        },
    )