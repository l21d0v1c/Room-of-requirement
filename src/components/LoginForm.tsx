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
import { useNavigate } from "react-router-dom"; // Importez useNavigate

const formSchema = z.object({
  email: z.string().min(1, { message: "Le champ 'Thing' ne peut pas être vide." }),
  password: z.string().min(6, { message: "Le Magic word doit contenir au moins 6 caractères." }),
});

const LoginForm = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Initialisez useNavigate

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
      let processedEmail = values.email;
      // Ajouter "@exemple.com" si l'email ne contient pas de "@"
      if (!processedEmail.includes("@")) {
        processedEmail = `${processedEmail}@exemple.com`;
      }

      // 1. Tenter de se connecter
      let { data, error } = await supabase.auth.signInWithPassword({
        email: processedEmail,
        password: values.password,
      });

      if (error) {
        // Si la connexion échoue, tenter l'inscription
        if (error.message.includes("Invalid login credentials") || error.message.includes("User not found")) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: processedEmail,
            password: values.password,
          });

          if (signUpError) {
            showError(`Erreur lors de l'inscription : ${signUpError.message}`);
            setIsLoggedIn(false);
          } else if (signUpData.user) {
            showSuccess("Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.");
            setIsLoggedIn(false); // L'utilisateur doit confirmer son email
          } else {
            showError("Une erreur inattendue est survenue lors de l'inscription.");
            setIsLoggedIn(false);
          }
        } else {
          showError(`Erreur de connexion : ${error.message}`);
          setIsLoggedIn(false);
        }
      } else if (data.user) {
        showSuccess("Connexion réussie ! Bienvenue dans la Room of Requirement.");
        setIsLoggedIn(true);
        navigate('/dashboard'); // Rediriger vers la page du tableau de bord
      } else {
        showError("Une erreur inattendue est survenue lors de la connexion.");
        setIsLoggedIn(false);
      }
    } catch (err: any) {
      showError(`Une erreur inattendue est survenue : ${err.message}`);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    // Ce bloc ne sera plus atteint car la redirection se fait avant
    return null;
  }

  return (
    <div className="mt-8 w-full max-w-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-200 text-center w-full block">Thing</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel className="text-gray-700 dark:text-gray-200 text-center w-full block">Magic word</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
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