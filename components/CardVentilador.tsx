type Props = {
    ligado: boolean | null | undefined;
};

export default function CardVentilador({ ligado }: Props) {
    let texto = "Indisponível";
    let corLed = "bg-gray-200 ring-gray-100";

    if (ligado === true) {
        texto = "Ligado";
        corLed = "bg-green-500 ring-green-100";
    } else if (ligado === false) {
        texto = "Desligado";
        corLed = "bg-gray-400 ring-gray-100";
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Ventilador</p>
            <div className="flex items-center gap-3 mt-2">
                <span className={"w-3 h-3 rounded-full ring-4 " + corLed}></span>
                <p className="text-3xl font-semibold">{texto}</p>
            </div>
        </div>
    );
}
