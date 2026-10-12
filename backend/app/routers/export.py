from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
import io
from ..schemas import ExportDocxRequest, ExportTxtRequest
from ..services.exporter import generate_docx

router = APIRouter(prefix="/api/export", tags=["export"])

@router.post("/docx")
async def export_docx_endpoint(payload: ExportDocxRequest):
    """Generate and download ATS-formatted Word document (.docx)."""
    try:
        docx_bytes = generate_docx(payload.resume_data)
        filename = payload.filename or "tailored_resume.docx"
        if not filename.endswith(".docx"):
            filename += ".docx"
            
        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate Word document: {str(e)}"
        )

@router.post("/txt")
async def export_txt_endpoint(payload: ExportTxtRequest):
    """Download plain text or markdown formatted resume."""
    filename = payload.filename or "tailored_resume.txt"
    return Response(
        content=payload.content.encode("utf-8"),
        media_type="text/plain; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
