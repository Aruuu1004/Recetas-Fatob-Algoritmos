
var RESPALDO_ESTADO = {
  "sesion": null,
  "usuarios": [
    {
      "id": 1,
      "rol": 2,
      "nombre": "Equipo FATOB",
      "fecha": "2026-01-01"
    }
  ],
  "recetas": [
    {
      "id": 1,
      "autor": 1,
      "cat": 1,
      "titulo": "Milanesas de carne con puré",
      "desc": "Las clásicas milanesas crocantes con un puré de papas bien cremoso. Un infaltable de domingo.",
      "ingredientes": [
        "4 bifes finos de nalga o peceto",
        "2 huevos",
        "1 taza de pan rallado",
        "1 diente de ajo picado",
        "2 cucharadas de perejil picado",
        "1 kg de papas",
        "50 g de manteca",
        "1/2 taza de leche",
        "Sal y pimienta",
        "Aceite para freír"
      ],
      "pasos": [
        "Preparar el batido: Batí los huevos con el ajo, el perejil, sal y pimienta.",
        "Empanar: Pasá cada bife por el huevo y después por el pan rallado, presionando bien.",
        "Freír: Calentá aceite en una sartén y dorá las milanesas 3 minutos de cada lado. Escurrilas sobre papel absorbente.",
        "Hacer el puré: Herví las papas peladas hasta que estén tiernas, pisalas y mezclalas con la manteca y la leche tibia.",
        "Servir: Acompañá las milanesas con el puré bien caliente y un chorrito de limón."
      ],
      "tiempo": 45,
      "imagen": "ejemplo_milanesas.jpg",
      "fecha": "2026-01-01"
    },
    {
      "id": 2,
      "autor": 1,
      "cat": 4,
      "titulo": "Empanadas de carne al horno",
      "desc": "Empanadas jugosas con relleno de carne cortada a cuchillo, cebolla de verdeo y comino.",
      "ingredientes": [
        "12 tapas de empanada para horno",
        "500 g de carne picada",
        "3 cebollas de verdeo",
        "1 cebolla",
        "2 huevos duros",
        "1 cucharadita de comino",
        "1 cucharadita de pimentón",
        "Aceitunas verdes",
        "Sal y pimienta",
        "1 huevo para pincelar"
      ],
      "pasos": [
        "Sofreír: Rehogá la cebolla y el verdeo picados en un poco de aceite hasta que estén transparentes.",
        "Cocinar la carne: Agregá la carne, el comino, el pimentón, sal y pimienta. Cociná 8 minutos y dejá enfriar.",
        "Armar el relleno: Sumá los huevos duros picados y las aceitunas.",
        "Rellenar: Poné una cucharada de relleno en cada tapa y cerrá con el repulgue.",
        "Hornear: Pincelá con huevo batido y horneá a 200 °C por 20 minutos, hasta que estén doradas."
      ],
      "tiempo": 60,
      "imagen": "ejemplo_empanadas.jpg",
      "fecha": "2026-01-01"
    },
    {
      "id": 3,
      "autor": 1,
      "cat": 1,
      "titulo": "Tallarines con salsa de tomate casera",
      "desc": "Una salsa simple de tomates frescos, ajo y albahaca que le da vida a cualquier pasta.",
      "ingredientes": [
        "500 g de tallarines",
        "6 tomates maduros",
        "2 dientes de ajo",
        "1 cebolla",
        "3 cucharadas de aceite de oliva",
        "Albahaca fresca",
        "1 cucharadita de azúcar",
        "Sal y pimienta",
        "Queso rallado"
      ],
      "pasos": [
        "Preparar los tomates: Hacé un corte en cruz a cada tomate, escaldalos 1 minuto, pelalos y picalos.",
        "Hacer la salsa: Rehogá la cebolla y el ajo en aceite, sumá los tomates, el azúcar, sal y pimienta. Cociná 20 minutos a fuego bajo.",
        "Cocinar la pasta: Herví los tallarines en agua con sal hasta que estén al dente.",
        "Mezclar: Combiná la pasta con la salsa y terminá con albahaca fresca y queso rallado."
      ],
      "tiempo": 35,
      "imagen": "ejemplo_tallarines.jpg",
      "fecha": "2026-01-01"
    },
    {
      "id": 4,
      "autor": 1,
      "cat": 5,
      "titulo": "Tarta de zapallitos y queso",
      "desc": "Una tarta liviana y casera, ideal para llevar al trabajo o compartir en una cena.",
      "ingredientes": [
        "2 tapas de tarta",
        "4 zapallitos verdes",
        "1 cebolla",
        "3 huevos",
        "200 g de queso cremoso",
        "1/2 taza de crema de leche",
        "Nuez moscada",
        "Sal y pimienta"
      ],
      "pasos": [
        "Cocinar el relleno: Salteá la cebolla y los zapallitos en rodajas hasta que se ablanden y largá el exceso de agua.",
        "Preparar la mezcla: Batí los huevos con la crema, la nuez moscada, sal y pimienta.",
        "Armar: Forrá un molde con una tapa, poné los zapallitos, el queso en cubos y volcá la mezcla. Tapá con la otra masa y sellá los bordes.",
        "Hornear: Cociná a 190 °C durante 35 minutos, hasta que esté bien dorada."
      ],
      "tiempo": 50,
      "imagen": "ejemplo_tarta.avif",
      "fecha": "2026-01-01"
    },
    {
      "id": 5,
      "autor": 1,
      "cat": 2,
      "titulo": "Flan casero con dulce de leche",
      "desc": "El postre argentino por excelencia: flan cremoso con caramelo y una buena cucharada de dulce de leche.",
      "ingredientes": [
        "1 litro de leche",
        "6 huevos",
        "1 taza de azúcar",
        "1 cucharadita de esencia de vainilla",
        "1 taza de azúcar para el caramelo",
        "Dulce de leche para servir",
        "Crema batida"
      ],
      "pasos": [
        "Hacer el caramelo: Derretí el azúcar en una flanera a fuego medio hasta que tome color ámbar y cubrí el fondo.",
        "Preparar la mezcla: Batí los huevos con el azúcar, sumá la leche y la vainilla y colá.",
        "Cocinar: Volcá en la flanera y cociná a baño María en horno a 170 °C por 50 minutos.",
        "Enfriar: Dejá entibiar y llevá a la heladera al menos 4 horas.",
        "Servir: Desmoldá y acompañá con dulce de leche y crema batida."
      ],
      "tiempo": 70,
      "imagen": "ejemplo_flan.avif",
      "fecha": "2026-01-01"
    },
    {
      "id": 6,
      "autor": 1,
      "cat": 3,
      "titulo": "Tostadas con palta y huevo",
      "desc": "Un desayuno rápido, nutritivo y con mucho sabor. Listo en diez minutos.",
      "ingredientes": [
        "4 rebanadas de pan de masa madre",
        "2 paltas maduras",
        "4 huevos",
        "1 limón",
        "Semillas de sésamo",
        "Sal y pimienta",
        "Un chorrito de aceite de oliva"
      ],
      "pasos": [
        "Tostar: Tostá el pan hasta que quede crocante.",
        "Pisar la palta: Pisá las paltas con jugo de limón, sal y pimienta.",
        "Cocinar los huevos: Hacelos fritos o poché, como más te gusten.",
        "Armar: Untá la palta sobre las tostadas, apoyá el huevo y terminá con sésamo y aceite de oliva."
      ],
      "tiempo": 10,
      "imagen": "ejemplo_tostadas.avif",
      "fecha": "2026-01-01"
    },
    {
      "id": 7,
      "autor": 1,
      "cat": 2,
      "titulo": "Brownie de chocolate",
      "desc": "Húmedo por dentro, con una costra crocante por fuera. Para los que aman el chocolate.",
      "ingredientes": [
        "200 g de chocolate semiamargo",
        "150 g de manteca",
        "1 taza de azúcar",
        "3 huevos",
        "1 taza de harina",
        "1/2 taza de nueces picadas",
        "1 pizca de sal"
      ],
      "pasos": [
        "Derretir: Fundí el chocolate con la manteca a baño María y dejá entibiar.",
        "Mezclar: Agregá el azúcar y los huevos de a uno, batiendo bien.",
        "Incorporar: Sumá la harina con la sal en forma envolvente y las nueces.",
        "Hornear: Volcá en un molde enmantecado y horneá a 180 °C por 25 minutos. Dejá enfriar antes de cortar."
      ],
      "tiempo": 40,
      "imagen": "ejemplo_brownie.jpg",
      "fecha": "2026-01-01"
    },
    {
      "id": 8,
      "autor": 1,
      "cat": 5,
      "titulo": "Ensalada tibia de lentejas",
      "desc": "Una ensalada completa y reconfortante, con proteínas vegetales y mucho color.",
      "ingredientes": [
        "2 tazas de lentejas cocidas",
        "1 zanahoria rallada",
        "1 morrón rojo",
        "1/2 cebolla morada",
        "Perejil fresco",
        "3 cucharadas de aceite de oliva",
        "1 cucharada de vinagre de manzana",
        "Sal y pimienta"
      ],
      "pasos": [
        "Preparar las verduras: Cortá el morrón y la cebolla en cubitos y rallá la zanahoria.",
        "Aderezar: Mezclá el aceite, el vinagre, sal y pimienta.",
        "Combinar: Juntá las lentejas tibias con las verduras y el aderezo.",
        "Servir: Terminá con perejil picado y comela tibia o fría."
      ],
      "tiempo": 25,
      "imagen": "ejemplo_lentejas.avif",
      "fecha": "2026-01-01"
    },
    {
      "id": 9,
      "autor": 1,
      "cat": 4,
      "titulo": "Provoleta a la parrilla",
      "desc": "Queso fundido, crocante por fuera y cremoso por dentro. La entrada perfecta antes del asado.",
      "ingredientes": [
        "2 provoletas de 200 g",
        "Orégano",
        "Ají molido",
        "1 cucharada de aceite de oliva",
        "1 tomate en rodajas",
        "Pan para acompañar"
      ],
      "pasos": [
        "Preparar: Poné las provoletas sobre la parrilla bien caliente o en una sartén de hierro.",
        "Dorar: Cociná 3 minutos por lado hasta que se forme una costra dorada.",
        "Condimentar: Espolvoreá con orégano y ají molido y sumá un hilo de aceite.",
        "Servir: Llevá a la mesa de inmediato, con tomate y pan."
      ],
      "tiempo": 15,
      "imagen": "ejemplo_provoleta.jpg",
      "fecha": "2026-01-01"
    },
    {
      "id": 10,
      "autor": 1,
      "cat": 3,
      "titulo": "Panqueques con dulce de leche",
      "desc": "Finitos, suaves y rellenos de dulce de leche. Perfectos para la merienda.",
      "ingredientes": [
        "2 huevos",
        "1 taza de harina",
        "1 1/2 tazas de leche",
        "1 cucharada de manteca derretida",
        "1 pizca de sal",
        "Dulce de leche repostero",
        "Manteca para la sartén"
      ],
      "pasos": [
        "Hacer la masa: Batí los huevos con la leche, la manteca y la sal, e incorporá la harina hasta que no queden grumos.",
        "Descansar: Dejá reposar la mezcla 15 minutos.",
        "Cocinar: Volcá un cucharón en una sartén enmantecada y cociná 1 minuto por lado.",
        "Rellenar: Untá cada panqueque con dulce de leche y doblalo en cuatro."
      ],
      "tiempo": 25,
      "imagen": "ejemplo_panqueques.jpg",
      "fecha": "2026-01-01"
    }
  ],
  "calificaciones": [],
  "comentarios": [],
  "favoritos": [],
  "seguidores": [],
  "productos": [],
  "carrito": [],
  "cupon": null,
  "cupones": {},
  "ultimoPedido": null
};
