import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/authentication/login-form";
import { RegisterForm } from "@/components/authentication/register-form";
import { AuthLayout } from "@/components/authentication/auth-layout";

export default function AuthPage() {
  return (
    <AuthLayout>
      <Tabs defaultValue="login" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="login"
            className="data-[state=active]:bg-[#00adb5] dark:data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Login
          </TabsTrigger>
          <TabsTrigger
            value="register"
            className="data-[state=active]:bg-[#00adb5] dark:data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Register
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <LoginForm />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm />
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
}
