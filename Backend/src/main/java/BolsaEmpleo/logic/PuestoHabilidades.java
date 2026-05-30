package BolsaEmpleo.logic;

import BolsaEmpleo.logic.Base.Caracteristicas;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "puesto_habilidades")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PuestoHabilidades {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "puesto_id")
    private Puesto puesto;

    @ManyToOne
    @JoinColumn(name = "caracteristica_id")
    private Caracteristicas habilidad;
    private Integer nivel;



}