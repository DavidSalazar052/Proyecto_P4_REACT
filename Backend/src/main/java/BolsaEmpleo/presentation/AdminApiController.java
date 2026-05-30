package BolsaEmpleo.presentation;

import BolsaEmpleo.logic.Base.Caracteristicas;
import BolsaEmpleo.logic.Puesto;
import BolsaEmpleo.logic.Service;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.draw.LineSeparator;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.awt.*;
import java.io.IOException;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminApiController {

    @Autowired
    private Service service;

    @GetMapping("/DashboardAdministrador")
    public ResponseEntity<?> mostrar_DashboardAdmin() {
        return ResponseEntity.ok(Map.of("mensaje", "Acceso al Dashboard de Administrador"));
    }

    @GetMapping("/EmpresasPendientes")
    public ResponseEntity<?> mostrar_EmpresasPendientes() {
        return ResponseEntity.ok(service.findAll_EmpresasNoAprobadas());
    }

    @PostMapping("/empresas/aprobar")
    public ResponseEntity<?> aprobarEmpresa(@RequestParam Integer id) {
        service.aprobarEmpresa(id);
        return ResponseEntity.ok(Map.of("mensaje", "Empresa aprobada exitosamente"));
    }

    @GetMapping("/OferentesPendientes")
    public ResponseEntity<?> mostrar_OferentesPendientes() {
        return ResponseEntity.ok(service.findAll_Oferentes_NoAprobadas());
    }

    @PostMapping("/oferentes/aprobar")
    public ResponseEntity<?> aprobarOferente(@RequestParam Integer id) {
        service.aprobarOferente(id);
        return ResponseEntity.ok(Map.of("mensaje", "Oferente aprobado exitosamente"));
    }

    @GetMapping("/AdminCaracteristicas")
    public ResponseEntity<?> mostrar_Caracteristicas(
            @RequestParam(required = false) String exito,
            @RequestParam(required = false) String error) {

        List<Caracteristicas> padres = service.findPadresCaracteristicas();
        Map<Integer, List<Caracteristicas>> hijos = new HashMap<>();
        service.construirMapaHijos(padres, hijos);
        List<Caracteristicas> todas = service.findAll_Caracteristicas();

        Map<String, Object> response = new HashMap<>();
        response.put("padres", padres);
        response.put("hijos", hijos);
        response.put("todas", todas);
        if (exito != null) response.put("exito", true);
        if (error != null) response.put("error", error);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/caracteristicas/crear")
    public ResponseEntity<?> crearCaracteristica(
            @RequestParam String nombre,
            @RequestParam(required = false) Integer padreId) {
        try {
            service.crearCaracteristica(nombre, padreId);
            return ResponseEntity.ok(Map.of("exito", true, "mensaje", "Característica creada"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reportes")
    public ResponseEntity<?> mostrar_Reportes() {
        int anioActual = java.time.LocalDate.now().getYear();
        List<Integer> anios = service.aniosDisponibles();
        if (anios.isEmpty()) anios = List.of(anioActual);
        return ResponseEntity.ok(Map.of("anios", anios, "anioActual", anioActual));
    }

    @GetMapping("/reportes/pdf")
    public void generar_ReportePDF(
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