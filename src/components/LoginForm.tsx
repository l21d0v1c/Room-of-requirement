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
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  email: z.string().min(1, { message: "Le champ 'Thing' ne peut pas être vide." }),
  password: z.string().min(6, { message: "Le Magic word doit contenir au moins 6 caractères." }),
});

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      let userIdentifier = values.email; // C'est l'entrée "Thing" de l'utilisateur

      // Si l'identifiant ne contient pas '@', ajoutez '@notreal.com'
      if (!userIdentifier.includes('@')) {
        userIdentifier = `${userIdentifier}@notreal.com`;
      }

      // 1. Tenter de se connecter
      let { data, error } = await supabase.auth.signInWithPassword({
        email: userIdentifier, // Utiliser l'identifiant potentiellement modifié
        password: values.password,
      });

      if (error) {
        // Si la connexion échoue, tenter l'inscription
        if (error.message.includes("Invalid login credentials") || error.message.includes("User not found")) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: userIdentifier, // Utiliser l'identifiant potentiellement modifié
            password: values.password,
          });

          if (signUpError) {
            showError(`Erreur lors de l'inscription : ${signUpError.message}`);
          } else if (signUpData.user) {
            showSuccess("Invisibility Spell", 2000); // Nouveau message et durée
            navigate('/dashboard'); // Rediriger vers la page du tableau de bord
          } else {
            showError("Une erreur inattendue est survenue lors de l'inscription.");
          }
        } else {
          showError(`Erreur de connexion : ${error.message}`);
        }
      } else if (data.user) {
        showSuccess("Invisibility Spell", 2000); // Nouveau message et durée
        navigate('/dashboard'); // Rediriger vers la page du tableau de bord
      } else {
        showError("Une erreur inattendue est survenue lors de la connexion.");
      }
    } catch (err: any) {
      showError(`Une erreur inattendue est survenue : ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 w-full max-w-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-100 text-center w-full block">Thing</FormLabel>
                <FormControl>
                  <Input className="bg-gray-100 text-gray-800 border-gray-300" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-100 text-center w-full block">Magic word</FormLabel>
                <FormControl>
                  <Input type="password" className="bg-gray-100 text-gray-800 border-gray-300" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Chargement..." : "Evoke"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;