import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { schema } from "../schema/Form3Schema";
import * as yup from "yup";
import { INTEREST_TAGS } from "../registration-constants";
import { ChevronLeft, ChevronRight, AtSign, PenTool, Loader } from "lucide-react";
import { getFromCookies, saveToCookies } from "@/utils/cookie";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function Form3({
    setStep
}: {
    setStep: (step: 1 | 2 | 3 | 4) => void;
}) {
    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            username: "",
            bio: "",
            interests: []
        }
    });

    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const loadData = async () => {
            const cookieValue = await getFromCookies("registration_step3");
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

    type Form3Schema = yup.InferType<typeof schema>;

    const selectedInterests = watch("interests") || [];

    const toggleInterest = (tag: string) => {
        const newInterests = selectedInterests.includes(tag)
            ? selectedInterests.filter(i => i !== tag)
            : [...selectedInterests, tag];
        setValue("interests", newInterests, { shouldValidate: true });
    };

    const onSubmit = async (data: Form3Schema) => {
        try{
            setLoading(true);

            await saveToCookies("registration_step3", data);
            const form1 = await getFromCookies("registration_step1");
            const form2 = await getFromCookies("registration_step2");

            if (!form1 || !form2 || !data) {
                throw new Error("Something went wrong, please try again");
            }
            const form1CookieValue = JSON.parse(form1);

            const payload = {
                email: form1CookieValue.email
            }

            const res = await axios.post("http://localhost:8000/api/v1/auth/verify-user", payload);
            if(res?.data?.success){
                console.log(res);
                toast.success(res?.data?.data?.message);
                setStep(4);
            }
        }catch(error){
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Something went wrong");
            } else {
                toast.error("Something went wrong");
            }
        }finally{
            setLoading(false);
        }
        
        
    };

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-3xl font-bold">Final touches</h2>
                <p className="text-slate-500 mt-2">Tell the world what you&apos;re about. Your username and interests define your Lumina experience.</p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="flex flex-col gap-2">
                    <label htmlFor="username" className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Unique Username</label>
                    <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <Input
                            id="username"
                            type="text"
                            placeholder="thestoryteller"
                            className="pl-10 h-12"
                            {...register("username")}
                        />
                    </div>
                    {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="bio" className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Short Bio</label>
                    <div className="relative">
                        <PenTool className="absolute left-3 top-4 text-slate-400 h-5 w-5" />
                        <Textarea
                            id="bio"
                            placeholder="Writing code by day, writing stories by night..."
                            className="pl-10 h-24 resize-none text-sm leading-relaxed pt-3"
                            {...register("bio")}
                        />
                    </div>
                    {errors.bio && <p className="text-red-500 text-sm">{errors.bio.message}</p>}
                </div>


                <div className="space-y-3">
                    <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider block">
                        Areas of Interest
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {INTEREST_TAGS.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleInterest(tag)}
                                className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${selectedInterests.includes(tag)
                                    ? 'border-black bg-black text-white'
                                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                    {errors.interests && <p className="text-red-500 text-sm">{errors.interests.message}</p>}
                </div>

                <footer className="mt-8 flex justify-between items-center gap-4">
                    <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-slate-400 font-bold text-sm hover:text-slate-900 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        <ChevronLeft size={18} /> Back
                    </button>
                    <button
                        disabled={loading}
                        type="submit"
                        className="flex-1 bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 cursor-pointer"
                    >
                        {loading ? "" : "Verify Account"} {loading ? <Loader className="animate-spin" size={18} /> : <ChevronRight size={18} />}
                    </button> 
                </footer>
            </form>
        </div>
    );
}
