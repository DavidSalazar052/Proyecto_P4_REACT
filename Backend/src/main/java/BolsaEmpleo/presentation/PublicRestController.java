package BolsaEmpleo.presentation;

import BolsaEmpleo.logic.Base.Caracteristicas;
import BolsaEmpleo.logic.Puesto;
import BolsaEmpleo.logic.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PublicRestController  (antes: RootRedirectController)          ║
 * ║  Rutas completamente públicas, sin autenticación.               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * RUTAS:
 *  GET /api/public/puestos/recientes          → top 5 puestos recientes (página inicio)
 *  GET /api/public/puestos/buscar?ids=1,2,3   → búsqueda por características
 *  GET /api/public/caracteristicas            → árbol de características (para filtros)
 */
@RestController
@RequestMapping("/api/public")
public class PublicRestController {

    @Autowired
    private Service service;

    // ── GET /api/public/puestos/recientes ────────────────────────────
    //
    // Response 200:
    // [
    //   {
    //     "id": 10, "descripcion": "Dev Backend Java", "salario": 1500000,
    //     "tipo": "PUBLICO", "estado": "ACTIVO", "fecha": "2025-05-01",
    //     "empresa": { "id": 1, "nombre": "TechCR", "localizacion": "San José" }
    //   }, ...
    // ]
    @GetMapping("/puestos/recientes")
    public ResponseEntity<List<Puesto>> puestosRecientes() {
        return ResponseEntity.ok(service.Top5_PuestosRecientes());
    }

    // ── GET /api/public/puestos/buscar?ids=1&ids=3 ───────────────────
    //
    // Parámetro: ids — lista de IDs de características a filtrar.
    // Si no se envían ids, retorna lista vacía.
    //
    // Response 200:
    // [
    //   { "id": 12, "descripcion": "...", "tipo": "PUBLICO", ... }, ...
    // ]
    @GetMapping("/puestos/buscar")
    public ResponseEntity<List<Puesto>> buscarPuestos(
            @RequestParam(required = false) List<Integer> ids) {
        if (ids == null || ids.isEmpty())
            return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(service.buscarPuestosPorCaracteristicas(ids));
    }

    // ── GET /api/public/caracteristicas ─────────────────────────────
    //
    // Devuelve el árbol completo de características para los filtros de búsqueda.
    //
    // Response 200:
    // {
    //   "padres": [ { "id":1, "nombre":"Programación", "padre":null }, ... ],
    //   "hijos":  { "1": [ {id:2,nombre:"Java",...}, {id:3,nombre:"Python",...} ], ... }
    // }
    @GetMapping("/caracteristicas")
    public ResponseEntity<?> caracteristicas() {
        List<Caracteristicas> padres = service.findPadresCaracteristicas();
        Map<Integer, List<Caracteristicas>> hijosMap = new HashMap<>();
        service.construirMapaHijos(padres, hijosMap);
        return ResponseEntity.ok(Map.of("padres", padres, "hijos", hijosMap));
    }
}
