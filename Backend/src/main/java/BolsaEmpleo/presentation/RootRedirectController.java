package BolsaEmpleo.presentation;

import BolsaEmpleo.logic.Base.Caracteristicas;
import BolsaEmpleo.logic.Puesto;
import BolsaEmpleo.logic.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class RootRedirectController {

    @Autowired
    private Service service;

    @GetMapping("/")
    public String mostrarPublico(Model model) {
        List<Puesto> puestos = service.Top5_PuestosRecientes();
        model.addAttribute("puestos", puestos);
        return "presentation/viewpublic";
    }

    @GetMapping("/buscaPuesto")
    public String mostrarBuscaPuesto(
            @RequestParam(required = false) List<Integer> ids,
            Model model) {


        List<Caracteristicas> padres = service.findPadresCaracteristicas();
        Map<Integer, List<Caracteristicas>> hijos = new HashMap<>();
        service.construirMapaHijos(padres, hijos);
        model.addAttribute("padres", padres);
        model.addAttribute("hijos", hijos);

        if (ids != null && !ids.isEmpty()) {
            List<Puesto> resultados = service.buscarPuestosPorCaracteristicas(ids);
            model.addAttribute("puestos", resultados);
        }

        return "presentation/buscaPuesto";
    }
}