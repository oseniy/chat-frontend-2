import { AuthHeader } from "@/features/auth/codeVerification/ui/authHeader";
import { AuthSupportForm } from "@/features/auth/supportForm/ui/authSupportForm";
import { BackgroundCardLayout } from "@/shared/layouts/card/backgroundCardLayout";

export default function Page() {
  return (
    <BackgroundCardLayout variant={"form"} className="flex flex-col pt-6">
      <AuthHeader
        backHref="/auth/phone"
        logoSize="sm"
        className="desktop:mt-12 mt-5"
        classBackButton="absolute desktop:left-20 top-2 left-8"
      />
      <h3 className="title desktop:subheadline desktop:mb-6 mb-5 text-center font-medium text-black">
        Служба поддержки
      </h3>
      <AuthSupportForm className="desktop:mx-16 mx-4 mb-10 flex flex-1 flex-col justify-between" />
    </BackgroundCardLayout>
  );
}
