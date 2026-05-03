import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { schema } from "../schema/Form1Schema";
import * as yup from "yup";
import { getFromCookies, saveToCookies } from "@/utils/cookie";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";


export default function Form1({
    setStep
}:{
    setStep: (step: 1 | 2 | 3 | 4) => void;
}) {

    const {
        register, 
        handleSubmit, 
        reset,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema),
    })

    useEffect(() => {
        const loadData = async () => {
            const cookieValue = await getFromCookies("registration_step1");
            if (cookieValue) {
                try {
                    const data = JSON.parse(cookieValue);
                    setValue("name", data.name);
                    setValue("email", data.email);
                    setValue("password", data.password);
                    setValue("confirmPassword", data.confirmPassword);
                } catch (e) {
                    console.error("Error parsing cookie data:", e);
                }
            }
        };
        loadData();
    }, [setValue]);

    type Form1Schema = yup.InferType<typeof schema>


    const onSubmit = async (data: Form1Schema) => {

        console.log(data);
        await saveToCookies("registration_step1", data);
        setStep(2);
    }

    return (
        <div>
            <h1 className="font-bold text-3xl">Begin your journey with lumina</h1>
            <p className="text-gray-500 text-[16px] mt-2">Every great story starts with a simple introduction. Tell us who you are.</p>
            
            
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto flex flex-col gap-1 mt-2">
                
                <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                    <Input type="text" id="name" className="h-12" placeholder="Enter your full name" {...register('name')}/>
                   <span className="text-red-500 text-sm"> {errors.name?.message && <p className="text-red-500">{errors.name.message}</p>}</span>
                </div> 

                <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Email</label>
                    <Input type="email" id="email" className="h-12" placeholder="Enter your email" {...register ('email')}/>
                    <span className="text-red-500 text-sm">{errors.email?.message && <p className="text-red-500">{errors.email.message}</p>}</span>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
                    <Input type="password" placeholder="* * * * * * * *" className="h-12" id="password" {...register('password')}/>
                    <span className="text-red-500 text-sm">{errors.password?.message && <p className="text-red-500">{errors.password.message}</p>}</span>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="confirmPassword" className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Confirm Password</label>
                    <Input type="password" placeholder="* * * * * * * *" className="h-12" id="confirmPassword" {...register('confirmPassword')}/>
                    <span className="text-red-500 text-sm">{errors.confirmPassword?.message && <p className="text-red-500">{errors.confirmPassword.message}</p>}</span>
                </div>


                <button type="submit" className="w-full bg-slate-900 text-white rounded-full py-4 font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all step-card-shadow mt-6">Next Step </button>
            </form>


        </div>
    );
}