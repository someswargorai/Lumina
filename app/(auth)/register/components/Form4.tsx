import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { schema } from "../schema/Form4Schema";
import * as yup from "yup";
import { Loader, Mail } from "lucide-react";
import { getFromCookies, saveToCookies } from "@/utils/cookie";

import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Form4({
    setStep
}: {
    setStep: (step: 1 | 2 | 3 | 4) => void;
}) {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            otp: ""
        }
    });

    const router = useRouter();
    type Form4Schema = yup.InferType<typeof schema>;
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: Form4Schema) => {
        try {
            setLoading(true);

            const form1 = await getFromCookies("registration_step1");
            const form2 = await getFromCookies("registration_step2");
            const form3 = await getFromCookies("registration_step3");
            if (!form1 || !form2 || !form3) {
                throw new Error("Something went wrong, please try again");
            }
            const form1CookieValue = JSON.parse(form1);
            const form2CookieValue = JSON.parse(form2);
            const form3CookieValue = JSON.parse(form3);

            const payload = {
                name: form1CookieValue.name,
                email: form1CookieValue.email,
                password: form1CookieValue.password,
                country: "IND",
                state: form2CookieValue.state,
                city: form2CookieValue.city,
                username: form3CookieValue.username,
                bio: form3CookieValue.bio,
                interests: form3CookieValue.interests,
                otp: data.otp
            }
            const res = await axios.post(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/verify-otp`, payload);
            if (res?.data?.success) {
                console.log(res);
                toast.success(res?.data?.data?.message);
                await saveToCookies("registration_step1", "");
                await saveToCookies("registration_step2", "");
                await saveToCookies("registration_step3", "");
                await saveToCookies("registration_step4", "");
                router.push("/login");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error?.response?.data?.message || "Something went wrong, please try again");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            <header className="text-center md:text-left">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0">
                    <Mail size={32} strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-bold">Check your mail</h2>
                <p className="text-slate-500 mt-2">
                    We&apos;ve sent a 6-digit verification code to your email.
                </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col gap-4">
                    <Input
                        type="text"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="w-full h-16 text-center text-2xl font-bold tracking-[0.5em] focus:border-slate-900 focus:ring-0 bg-slate-50"
                        {...register("otp")}
                    />
                    {errors.otp && <p className="text-red-500 text-sm text-center">{errors.otp.message}</p>}
                </div>


                <div className="text-center">
                    <p className="text-slate-400 text-xs font-medium">
                        Didn&apos;t receive a code? <button type="button" className="text-slate-900 font-bold hover:underline cursor-pointer">Resend code</button>
                    </p>
                </div>

                <div className="pt-4 space-y-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white rounded-full py-4 font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all step-card-shadow cursor-pointer"
                    >
                        {loading ? "" : "Complete Registration"} {loading ? <Loader className="animate-spin" size={18} /> : null}
                    </button>
                    <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                        Go back and edit details
                    </button>
                </div>
            </form>
        </div>
    );
}
