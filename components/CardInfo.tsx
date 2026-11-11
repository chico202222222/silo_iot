type Props = {
    titulo: string;
    valor: string;
    unidade?: string;
};

export default function CardInfo({ titulo, valor, unidade }: Props) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{titulo}</p>
            <p className="text-3xl font-semibold tabular-nums mt-2">
                {valor}
                {valor !== "—" && unidade && <span className="text-base font-medium ml-1 text-pucpr">{unidade}</span>}
            </p>
        </div>
    );
}
