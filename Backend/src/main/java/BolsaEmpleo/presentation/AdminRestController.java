package BolsaEmpleo.presentation;

import BolsaEmpleo.logic.Base.Caracteristicas;
import BolsaEmpleo.logic.Base.Empresa;
import BolsaEmpleo.logic.Base.Oferente;
import BolsaEmpleo.logic.Puesto;
import BolsaEmpleo.logic.Service;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.awt.Color;
import java.io.IOException;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.List;

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  AdminRestController  (antes: AdminController)                   ║
 * ║  Protegido por hasRole("ADM") vía SecurityConfig.                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * RUTAS:
 *  GET  /api/admin/empresas/pendientes            → lista empresas no aprobadas
 *  POST /api/admin/empresas/{id}/aprobar          → aprobar empresa
 *  GET  /api/admin/oferentes/pendientes           → lista oferentes no aprobados
 *  POST /api/admin/oferentes/{id}/aprobar         → aprobar oferente
 *  GET  /api/admin/caracteristicas               → árbol de características
 *  POST /api/admin/caracteristicas               → crear característica
 *  GET  /api/admin/reportes/anios                → años disponibles en BD
 *  GET  /api/admin/reportes/pdf?anio=&mes=       → descarga PDF (igual que antes)
 */
@RestController
@RequestMapping("/api/admin")
public class AdminRestController {

    @Autowired
    private Service service;

    // ════════════════════════════════════════════════════════════════
    //  EMPRESAS PENDIENTES
    // ════════════════════════════════════════════════════════════════

    // GET /api/admin/empresas/pendientes
    //
    // Response 200 – array de empresas sin aprobar:
    // [
    //   {
    //     "id": 1,
    //     "nombre": "TechCR SA",
    //     "localizacion": "San José",
    //     "correo": "info@techcr.com",
    //     "telefono": "88001122",
    //     "descripcion": "Empresa de software",
    //     "aprobada": false
    //   }, ...
    // ]
    @GetMapping("/empresas/pendientes")
    public ResponseEntity<List<Empresa>> empresasPendientes() {
        return ResponseEntity.ok(service.findAll_EmpresasNoAprobadas());
    }

    // POST /api/admin/empresas/{id}/aprobar
    //
    // Response 200: { "mensaje": "Empresa aprobada." }
    // Response 404: { "error": "Empresa no encontrada: 5" }
    @PostMapping("/empresas/{id}/aprobar")
    public ResponseEntity<?> aprobarEmpresa(@PathVariable Integer id) {
        try {
            service.aprobarEmpresa(id);
            return ResponseEntity.ok(Map.of("mensaje", "Empresa aprobada."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ════════════════════════════════════════════════════════════════
    //  OFERENTES PENDIENTES
    // ════════════════════════════════════════════════════════════════

    // GET /api/admin/oferentes/pendientes
    //
    // Response 200 – array de oferentes sin aprobar:
    // [
    //   {
    //     "id": 2,
    //     "nombre": "Juan",
    //     "apellido": "Pérez",
    //     "nacionalidad": "CR",
    //     "telefono": "88001122",
    //     "correo": "juan@mail.com",
    //     "residencia": "Heredia",
    //     "aprobado": false
    //   }, ...
    // ]
    @GetMapping("/oferentes/pendientes")
    public ResponseEntity<List<Oferente>> oferentesPendientes() {
        return ResponseEntity.ok(service.findAll_Oferentes_NoAprobadas());
    }

    // POST /api/admin/oferentes/{id}/aprobar
    //
    // Response 200: { "mensaje": "Oferente aprobado." }
    // Response 404: { "error": "Oferente no encontrado: 3" }
    @PostMapping("/oferentes/{id}/aprobar")
    public ResponseEntity<?> aprobarOferente(@PathVariable Integer id) {
        try {
            service.aprobarOferente(id);
            return ResponseEntity.ok(Map.of("mensaje", "Oferente aprobado."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ════════════════════════════════════════════════════════════════
    //  CARACTERÍSTICAS (árbol jerárquico)
    // ════════════════════════════════════════════════════════════════

    // GET /api/admin/caracteristicas
    //
    // Devuelve estructura plana + mapa de hijos para reconstruir el árbol en React.
    //
    // Response 200:
    // {
    //   "todas": [
    //     { "id": 1, "nombre": "Programación", "padre": null },
    //     { "id": 2, "nombre": "Java",         "padre": { "id": 1, "nombre": "Programación" } },
    //     ...
    //   ],
    //   "padres": [ { "id": 1, "nombre": "Programación", "padre": null }, ... ],
    //   "hijos":  { "1": [2, 3], "2": [] }   ← map de id → lista de ids de hijos directos
    // }
    @GetMapping("/caracteristicas")
    public ResponseEntity<?> listarCaracteristicas() {
        List<Caracteristicas> padres = service.findPadresCaracteristicas();
        Map<Integer, List<Caracteristicas>> hijosMap = new HashMap<>();
        service.construirMapaHijos(padres, hijosMap);
        List<Caracteristicas> todas = service.findAll_Caracteristicas();

        return ResponseEntity.ok(Map.of(
                "todas",  todas,
                "padres", padres,
                "hijos",  hijosMap
        ));
    }

    // POST /api/admin/caracteristicas
    //
    // Request body (JSON):
    // { "nombre": "Python", "padreId": 1 }   ← padreId es opcional (null = raíz)
    //
    // Response 201: { "mensaje": "Característica creada." }
    // Response 400: { "error": "El nombre no puede estar vacío." }
    @PostMapping("/caracteristicas")
    public ResponseEntity<?> crearCaracteristica(@RequestBody Map<String, Object> body) {
        try {
            String  nombre  = (String)  body.get("nombre");
            Integer padreId = body.get("padreId") != null
                    ? Integer.valueOf(body.get("padreId").toString()) : null;

            service.crearCaracteristica(nombre, padreId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("mensaje", "Característica creada."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ════════════════════════════════════════════════════════════════
    //  REPORTES
    // ════════════════════════════════════════════════════════════════

    // GET /api/admin/reportes/anios
    //
    // Response 200: [2024, 2025]
    @GetMapping("/reportes/anios")
    public ResponseEntity<List<Integer>> aniosDisponibles() {
        List<Integer> anios = service.aniosDisponibles();
        if (anios.isEmpty()) anios = List.of(java.time.LocalDate.now().getYear());
        return ResponseEntity.ok(anios);
    }

    // GET /api/admin/reportes/pdf?anio=2025&mes=5
    //
    // Descarga directa del PDF (igual que antes, no cambia la lógica).
    // React abre esta URL en una nueva pestaña: window.open('/api/admin/reportes/pdf?anio=2025&mes=5')
    @GetMapping("/reportes/pdf")
    public void generarReportePDF(
            @RequestParam int anio,
            @RequestParam int mes,
            HttpServletResponse response) throws IOException {

        List<Puesto> puestos = service.puestosPorMes(anio, mes);
        String nombreMes = Month.of(mes).getDisplayName(TextStyle.FULL, new Locale("es", "CR"));
        nombreMes = nombreMes.substring(0, 1).toUpperCase() + nombreMes.substring(1);

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition",
                "attachment; filename=\"reporte_puestos_" + anio + "_" + String.format("%02d", mes) + ".pdf\"");

        Document doc = new Document(PageSize.A4, 50, 50, 60, 50);
        PdfWriter.getInstance(doc, response.getOutputStream());
        doc.open();

        Font fTitulo    = new Font(Font.HELVETICA, 18, Font.BOLD,   new Color(30, 58, 138));
        Font fSubtitulo = new Font(Font.HELVETICA, 11, Font.NORMAL, new Color(100, 116, 139));
        Font fHeader    = new Font(Font.HELVETICA,  9, Font.BOLD,   Color.WHITE);
        Font fCelda     = new Font(Font.HELVETICA,  9, Font.NORMAL, new Color(30, 30, 30));
        Font fResumen   = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(55, 65, 81));
        Font fResumenB  = new Font(Font.HELVETICA, 10, Font.BOLD,   new Color(30, 58, 138));

        Paragraph titulo = new Paragraph("Reporte de Puestos Solicitados", fTitulo);
        titulo.setAlignment(Element.ALIGN_CENTER);
        doc.add(titulo);

        Paragraph subtitulo = new Paragraph("Período: " + nombreMes + " " + anio, fSubtitulo);
        subtitulo.setAlignment(Element.ALIGN_CENTER);
        subtitulo.setSpacingAfter(6);
        doc.add(subtitulo);

        doc.add(new Chunk(new LineSeparator(1f, 100f, new Color(30, 58, 138), Element.ALIGN_CENTER, -2)));
        Paragraph espacio = new Paragraph(" ");
        espacio.setSpacingAfter(4);
        doc.add(espacio);

        long activos   = puestos.stream().filter(p -> "ACTIVO".equalsIgnoreCase(p.getEstado())).count();
        long inactivos = puestos.stream().filter(p -> "INACTIVO".equalsIgnoreCase(p.getEstado())).count();
        long publicos  = puestos.stream().filter(p -> "PUBLICO".equalsIgnoreCase(p.getTipo())).count();
        long privados  = puestos.stream().filter(p -> "PRIVADO".equalsIgnoreCase(p.getTipo())).count();

        PdfPTable resumen = new PdfPTable(4);
        resumen.setWidthPercentage(100);
        resumen.setSpacingAfter(14);
        Color bgResumen = new Color(239, 246, 255);
        String[] etiquetas = {"Total de puestos", "Activos", "Inactivos", "Públicos / Privados"};
        String[] valores   = {String.valueOf(puestos.size()), String.valueOf(activos),
                String.valueOf(inactivos), publicos + " / " + privados};
        for (int i = 0; i < 4; i++) {
            PdfPCell cEtiq = new PdfPCell(new Phrase(etiquetas[i], fResumen));
            cEtiq.setBackgroundColor(bgResumen); cEtiq.setBorderColor(new Color(191,219,254)); cEtiq.setPadding(6);
            resumen.addCell(cEtiq);
            PdfPCell cVal = new PdfPCell(new Phrase(valores[i], fResumenB));
            cVal.setBackgroundColor(bgResumen); cVal.setBorderColor(new Color(191,219,254));
            cVal.setPadding(6); cVal.setHorizontalAlignment(Element.ALIGN_CENTER);
            resumen.addCell(cVal);
        }
        doc.add(resumen);

        if (puestos.isEmpty()) {
            Paragraph vacio = new Paragraph("No se registraron puestos en " + nombreMes + " " + anio + ".",
                    new Font(Font.HELVETICA, 11, Font.ITALIC, new Color(107, 114, 128)));
            vacio.setAlignment(Element.ALIGN_CENTER); vacio.setSpacingBefore(20);
            doc.add(vacio);
        } else {
            PdfPTable tabla = new PdfPTable(new float[]{1.5f, 3.5f, 1.5f, 1.5f, 1.5f, 1.5f});
            tabla.setWidthPercentage(100); tabla.setSpacingBefore(4);
            Color bgHeader = new Color(30, 58, 138);
            for (String h : new String[]{"ID", "Descripción", "Empresa", "Tipo", "Estado", "Fecha"}) {
                PdfPCell cell = new PdfPCell(new Phrase(h, fHeader));
                cell.setBackgroundColor(bgHeader); cell.setPadding(7);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER); cell.setBorder(Rectangle.NO_BORDER);
                tabla.addCell(cell);
            }
            Color bgPar = new Color(248,250,252), bgImpar = Color.WHITE, border = new Color(226,232,240);
            for (int i = 0; i < puestos.size(); i++) {
                Puesto p = puestos.get(i);
                Color bgFila = (i % 2 == 0) ? bgPar : bgImpar;
                for (String texto : new String[]{
                        String.valueOf(p.getId()),
                        p.getDescripcion() != null ? p.getDescripcion() : "-",
                        p.getEmpresa()     != null ? p.getEmpresa().getNombre() : "-",
                        p.getTipo()        != null ? p.getTipo()    : "-",
                        p.getEstado()      != null ? p.getEstado()  : "-",
                        p.getFecha()       != null ? p.getFecha()   : "-"}) {
                    PdfPCell cell = new PdfPCell(new Phrase(texto, fCelda));
                    cell.setBackgroundColor(bgFila); cell.setBorderColor(border); cell.setPadding(5);
                    tabla.addCell(cell);
                }
            }
            doc.add(tabla);
        }

        Paragraph pie = new Paragraph("Generado el " + java.time.LocalDate.now() + " · Sistema Bolsa de Empleo",
                new Font(Font.HELVETICA, 8, Font.ITALIC, new Color(156, 163, 175)));
        pie.setAlignment(Element.ALIGN_RIGHT); pie.setSpacingBefore(16);
        doc.add(pie);
        doc.close();
    }
}
