"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { showSuccess, showError } from "@/utils/toast";

const formSchema = z.object({
  password: z.string().min(1, { message: "Le mot de passe est requis." }),
});

const LoginForm = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // For simplicity, a hardcoded password "dyad"
    if (values.password === "dyad") {
      setIsLoggedIn(true);
      showSuccess("Connexion réussie ! Bienvenue dans la Room of Requirement.");
    } else {
      setIsLoggedIn(false);
      showError("Mot de passe incorrect. Veuillez réessayer.");
    }
  };

  if (isLoggedIn) {
    return (
      <div className="mt-8 text-center text-green-600 dark:text-green-400 text-lg font-semibold">
        Accès accordé à la Room of Requirement !
      </div>
    );
  }

  return (
    <div className="mt-8 w-full max-w-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-200">Mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Entrez le mot de passe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Se connecter
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;