import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect } from "expo-router";
import { Mail, LockKeyhole } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { InlineNotice } from "@/components/ui/InlineNotice";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { signInSchema, type SignInFormValues } from "@/features/auth/schemas/signInSchema";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { isSupabaseConfigured } from "@/lib/supabase";
import { colors } from "@/theme/colors";
import { textStyles } from "@/theme/text";

export default function LoginRoute() {
  const { signIn, session, profile, isLoading } = useAuthSession();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  if (session && profile?.role === "manager") {
    return <Redirect href="/manager" />;
  }

  if (session && profile) {
    return <Redirect href="/operator" />;
  }

  if (session && !profile) {
    return <LoadingState label="Carregando perfil..." />;
  }

  const submit = handleSubmit(async (values) => {
    const result = await signIn(values.email, values.password);

    if (!result.ok) {
      setError("root", {
        message: result.message
      });
    }
  });

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ gap: 24 }}>
          <View style={{ gap: 8 }}>
            <Text style={textStyles.eyebrow}>Registro operacional</Text>
            <Text style={textStyles.title}>Entrar</Text>
          </View>

          {!isSupabaseConfigured ? (
            <InlineNotice
              tone="error"
              message="Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
            />
          ) : null}

          {errors.root?.message ? (
            <InlineNotice tone="error" message={errors.root.message} />
          ) : null}

          <View style={{ gap: 12 }}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextField
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.email?.message}
                  icon={Mail}
                  inputMode="email"
                  label="E-mail"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="nome@exemplo.com"
                  value={value}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onBlur, onChange, value } }) => (
                <TextField
                  autoCapitalize="none"
                  autoComplete="password"
                  error={errors.password?.message}
                  icon={LockKeyhole}
                  label="Senha"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Sua senha"
                  secureTextEntry
                  value={value}
                />
              )}
            />
          </View>

          <Button
            disabled={!isSupabaseConfigured || isLoading || isSubmitting}
            loading={isSubmitting}
            onPress={submit}
            title="Entrar"
          />

          <Text style={{ color: colors.textMuted, lineHeight: 20 }}>
            Use contas criadas conscientemente no Supabase Auth. O cadastro público pode ser
            desabilitado depois da criação das duas contas.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
