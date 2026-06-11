import { useRef, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Leaf } from "lucide-react-native";

import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n/I18nProvider";
import { typography } from "@/styles/typography";
import Wine from "assets/svg/wine.svg";
import Monsterra from "assets/svg/monsterra.svg";

type AuthMode = "signIn" | "register";

const keyboardAvoidingBehavior = Platform.OS === "ios" ? "padding" : "height";
const keyboardDismissMode = Platform.OS === "ios" ? "interactive" : "on-drag";

export function AuthPage() {
  const { error, register, resetPassword, signIn } = useAuth();
  const { t } = useI18n();
  const passwordInputRef = useRef<TextInput>(null);
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit() {
    setIsSubmitting(true);
    setNotice(null);

    try {
      if (mode === "register") {
        await register(email, password);
      } else {
        await signIn(email, password);
      }
    } catch {
      // Error state is handled by AuthProvider.
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword() {
    if (!email.trim()) {
      setNotice(t("auth.resetNeedsEmail"));
      return;
    }

    setIsSubmitting(true);
    setNotice(null);

    try {
      await resetPassword(email);
      setNotice(t("auth.resetSent"));
    } catch {
      // Error state is handled by AuthProvider.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ImageBackground
        resizeMode="cover"
        source={require("../../assets/background.jpg")}
        style={StyleSheet.absoluteFillObject}
      >
        <View className="flex-1 bg-stone-950/10" />
      </ImageBackground>
      <KeyboardAvoidingView
        behavior={keyboardAvoidingBehavior}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ScrollView
          contentContainerClassName="grow justify-center gap-8 px-6 py-8 pb-28"
          keyboardDismissMode={keyboardDismissMode}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback
            accessible={false}
            onPress={Keyboard.dismiss}
          >
            <View className="w-full max-w-md self-center gap-2">
              <View className="items-center gap-4">
                <View className="h-14 w-14 items-center justify-center rounded-lg bg-emerald-700/95">
                  <Monsterra height={36} width={36} />
                </View>
                <View className="items-center">
                  <Text className={`${typography.appTitle} text-stone-950`}>
                    Gardener
                  </Text>
                  <Text
                    className={`mt-2 max-w-72 pb-8 text-center ${typography.sectionTitle} text-stone-700`}
                  >
                    {t("auth.subtitle")}
                  </Text>
                </View>
              </View>

              <View className="gap-4 rounded-lg border border-white/80 bg-white/80 px-5 py-6 shadow-sm shadow-stone-300">
                <View className="flex-row rounded-lg bg-stone-100 p-1">
                  <Pressable
                    className={`flex-1 rounded-lg py-2 ${
                      mode === "signIn" ? "bg-white" : ""
                    }`}
                    onPress={() => setMode("signIn")}
                  >
                    <Text
                      className={`text-center ${typography.bodyStrong} ${
                        mode === "signIn"
                          ? "text-emerald-800"
                          : "text-stone-500"
                      }`}
                    >
                      {t("auth.signIn")}
                    </Text>
                  </Pressable>
                  <Pressable
                    className={`flex-1 rounded-lg py-2 ${
                      mode === "register" ? "bg-white" : ""
                    }`}
                    onPress={() => setMode("register")}
                  >
                    <Text
                      className={`text-center ${typography.bodyStrong} ${
                        mode === "register"
                          ? "text-emerald-800"
                          : "text-stone-500"
                      }`}
                    >
                      {t("auth.register")}
                    </Text>
                  </Pressable>
                </View>

                <View className="gap-2">
                  <Text className={`${typography.fieldLabel} text-stone-800`}>
                    {t("auth.email")}
                  </Text>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="email"
                    className={`rounded-lg border border-stone-200 bg-white px-3 py-3 ${typography.input} text-stone-950`}
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                    placeholder="email@example.com"
                    placeholderTextColor="#a8a29e"
                    returnKeyType="next"
                    textContentType="emailAddress"
                    value={email}
                  />
                </View>

                <View className="gap-2">
                  <Text className={`${typography.fieldLabel} text-stone-800`}>
                    {t("auth.password")}
                  </Text>
                  <TextInput
                    ref={passwordInputRef}
                    autoCapitalize="none"
                    className={`rounded-lg border border-stone-200 bg-white px-3 py-3 ${typography.input} text-stone-950`}
                    onChangeText={setPassword}
                    onSubmitEditing={() => void handleSubmit()}
                    placeholder="••••••••"
                    placeholderTextColor="#a8a29e"
                    returnKeyType="done"
                    secureTextEntry
                    textContentType="password"
                    value={password}
                  />
                </View>

                {error ? (
                  <Text
                    className={`rounded-lg bg-rose-100 px-3 py-2 ${typography.empty} text-rose-700`}
                  >
                    {error}
                  </Text>
                ) : null}
                {notice ? (
                  <Text
                    className={`rounded-lg bg-emerald-100 px-3 py-2 ${typography.empty} text-emerald-800`}
                  >
                    {notice}
                  </Text>
                ) : null}

                <Pressable
                  className="rounded-lg bg-emerald-700 py-3 active:bg-emerald-800"
                  disabled={isSubmitting}
                  onPress={handleSubmit}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text
                      className={`text-center ${typography.button} text-white`}
                    >
                      {mode === "register" ? t("auth.createAccount") : t("auth.signInAction")}
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  disabled={isSubmitting}
                  onPress={handleResetPassword}
                >
                  <Text
                    className={`text-center ${typography.bodyStrong} text-emerald-800`}
                  >
                    {t("auth.forgotPassword")}
                  </Text>
                </Pressable>

                <View
                  className="absolute -top-44 -left-5"
                  pointerEvents="none"
                >
                  <Wine
                    width={400}
                    height={480}
                    style={{
                      transform: [{ rotate: "270deg" }],
                    }}
                    preserveAspectRatio="none"
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
