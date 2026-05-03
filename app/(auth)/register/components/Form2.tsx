import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { schema } from "../schema/Form2Schema";
import * as yup from "yup";
import { INDIAN_STATES } from "../registration-constants";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { getFromCookies, saveToCookies } from "@/utils/cookie";
import { useEffect } from "react";

export default function Form2({
    setStep
}: {
    setStep: (step: 1 | 2 | 3 | 4) => void;
}) {
    const {
        handleSubmit,
        watch,
        setValue,
        control,
        reset,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            state: "",
            city: ""
        }
    });

    useEffect(() => {
        const loadData = async () => {
            const cookieValue = await getFromCookies("registration_step2");
            if (cookieValue) {
                try {
                    const data = JSON.parse(cookieValue);
                    reset(data);
                } catch (e) {
                    console.error("Error parsing cookie data:", e);
                }
            }
        };
        loadData();
    }, [reset]);

    type Form2Schema = yup.InferType<typeof schema>;

    const selectedState = watch("state");
    const cities = selectedState ? INDIAN_STATES[selectedState] || [] : [];

    const onSubmit = async (data: Form2Schema) => {
        console.log(data);
        await saveToCookies("registration_step2", data);
        setStep(3);
    };


    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-3xl font-bold">Where are you based?</h2>
                <p className="text-slate-500 mt-2">We use your location to surface stories from local writers and suggest relevant regional topics.</p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Country</label>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-slate-500 flex items-center gap-3 cursor-not-allowed h-12">
                        <span className="text-lg">🇮🇳</span>
                        <span className="font-medium text-sm">India</span>
                        <span className="ml-auto text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Default</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="state" className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">State</label>
                        <Controller
                            name="state"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        setValue("city", "");
                                    }}
                                    value={field.value}
                                >
                                    <SelectTrigger className="w-full border border-gray-200 rounded-md p-3 focus:border-gray-300 focus:outline-none focus:ring-0 bg-white cursor-pointer h-12">
                                        <SelectValue placeholder="Select State" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(INDIAN_STATES).map(s => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="city" className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">City</label>
                        <Controller
                            name="city"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={!selectedState}
                                >
                                    <SelectTrigger className={`w-full border border-gray-200 rounded-md p-3 focus:border-gray-300 focus:outline-none focus:ring-0 bg-white cursor-pointer h-12 ${!selectedState && 'opacity-50 cursor-not-allowed'}`}>
                                        <SelectValue placeholder="Select City" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cities.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
                    </div>
                </div>

                {selectedState && cities.length > 0 && (
                    <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                            <hr className="flex-1 border-slate-100" />
                            <span>Suggested for {selectedState}</span>
                            <hr className="flex-1 border-slate-100" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {cities.slice(0, 6).map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setValue("city", c, { shouldValidate: true })}
                                    className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all ${watch("city") === c
                                        ? 'border-slate-900 bg-slate-900 text-white'
                                        : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'
                                        }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <footer className="mt-8 flex justify-between items-center gap-4">
                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-slate-400 font-bold text-sm hover:text-slate-900 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        <ChevronLeft size={18} /> Back
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 cursor-pointer"
                    >
                        Next Step <ChevronRight size={18} />
                    </button>
                </footer>
            </form>
        </div>
    );
}
