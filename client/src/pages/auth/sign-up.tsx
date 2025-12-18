import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import Logo from "@/components/logo";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const SignUp = () => {
  const { register, isSigningUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSigningUp) return;

    const result = await register(values);

    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Account Created Successfully");
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-linear-to-br from-muted to-background p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-2">
          <Logo />
          <div className="space-y-1">
            <CardTitle className="text-xl">Create your account</CardTitle>
            <p className="text-sm text-muted-foreground dark:text-secondary">
              Sign up to get started
            </p>
          </div>
        </CardHeader>

        <Separator />

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          {...field}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button type="submit" disabled={isSigningUp} className="w-full">
                {isSigningUp ? (
                  <span className="flex items-center gap-2">
                    <Spinner /> Creating account
                  </span>
                ) : (
                  "Sign Up"
                )}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link
                  to={"/"}
                  className="underline text-primary dark:text-secondary"
                >
                  Sign in
                </Link>
              </div>

              {/* Footer */}
              <p className="text-center text-xs text-muted-foreground">
                By signing up, you agree to our{" "}
                <span className="underline cursor-pointer">
                  Terms & Conditions
                </span>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
