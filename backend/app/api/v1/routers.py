from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from schemas.permit import PolygonSchema, PointSchema, AnnotationSchema
from crud.crud_polygons import createPolygon, getPolygons, getPolygonById, updatePolygon
from crud.crud_points import getPoints, createPoint, getPointById, updatePoint
from crud.crud_annotations import getAnnotations, createAnnotation, getAnnotationById, updateAnnotation
from crud.crud_file import uploadReport

router = APIRouter()

#################### Polygon ####################
@router.get("/polygons")
async def get_polygons(db: AsyncSession = Depends(get_db)):
    return await getPolygons(db)

@router.post("/polygon")
async def create_polygon(polygon_data: PolygonSchema, db: AsyncSession = Depends(get_db)):
    res = await createPolygon(db, polygon_data)
    return res

@router.get("/polygon/{objectid}")
async def get_polygon_by_id(objectid: int, db: AsyncSession = Depends(get_db)):
    res = await getPolygonById(db, objectid)
    return res

@router.put("/polygon/{objectid}")
async def update_polygon(objectid: int, polygon_data: PolygonSchema, db: AsyncSession = Depends(get_db)):
    res = await updatePolygon(db, objectid, polygon_data)
    return res

#################### Point ####################
@router.get("/points")
async def get_points(db: AsyncSession = Depends(get_db)):
    return await getPoints(db)

@router.post("/point")
async def create_point(point_data: PointSchema, db: AsyncSession = Depends(get_db)):
    res = await createPoint(db, point_data)
    return res

@router.get("/point/{objectid}")
async def get_point_by_id(objectid: int, db: AsyncSession = Depends(get_db)):
    res = await getPointById(db, objectid)
    return res

@router.put("/point/{objectid}")
async def update_point(objectid: int, point_data: PointSchema, db: AsyncSession = Depends(get_db)):
    res = await updatePoint(db, objectid, point_data)
    return res

#################### Annotation ####################
@router.get("/annotations")
async def get_annotations(db: AsyncSession = Depends(get_db)):
    return await getAnnotations(db)

@router.post("/annotation")
async def create_annotation(annotation_data: AnnotationSchema, db: AsyncSession = Depends(get_db)):
    res = await createAnnotation(db, annotation_data)
    return res

@router.get("/annotation/{objectid}")
async def get_annotation_by_id(objectid: int, db: AsyncSession = Depends(get_db)):
    res = await getAnnotationById(db, objectid)
    return res

@router.put("/annotation/{objectid}")
async def update_annotation(objectid: int, annotation_data: AnnotationSchema, db: AsyncSession = Depends(get_db)):
    res = await updateAnnotation(db, objectid, annotation_data)

#################### File ####################
@router.post("/upload/report")
async def upload_report(files: list[UploadFile] = File(...), db: AsyncSession = Depends(get_db)):
    result = await uploadReport(db, files)
    return result