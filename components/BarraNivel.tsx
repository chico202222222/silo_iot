import { formatarNumero } from "@/lib/formatar";

type Props = {
    nivel: number | null;
};

export default function BarraNivel({ nivel }: Props) {
    let largura = 0;

    if (nivel !== null) {
        largura = Math.max(0, Math.min(100, nivel));
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-baseline">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Nível do silo</p>
                <p className="text-2xl font-semibold tabular-nums">
                    {nivel === null ? "—" : formatarNumero(largura, 1) + "%"}
                </p>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-pucpr rounded-full transition-all duration-500" style={{ width: largura + "%" }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 tabular-nums mt-1.5">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
            </div>
        </div>
    );
}
