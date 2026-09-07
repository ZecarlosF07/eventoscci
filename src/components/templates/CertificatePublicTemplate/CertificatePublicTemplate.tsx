import type { CertificatePublicTemplateProps } from "@/components/templates/CertificatePublicTemplate/types/certificate-public-template.types";
import { CertificateAccountCallout } from "@/features/certificates/components/CertificateAccountCallout";
import { CertificatePublicHero } from "@/features/certificates/components/CertificatePublicHero";
import { CertificateRecommendations } from "@/features/certificates/components/CertificateRecommendations";

export function CertificatePublicTemplate({ accountHref, accountLabel, certificate, recommendations, token }: CertificatePublicTemplateProps) {
  return (
    <div className="bg-cci-50">
      <CertificatePublicHero certificate={certificate} token={token} />
      <div className="mx-auto w-full max-w-7xl space-y-8 px-5 py-10 sm:space-y-10 sm:px-8 sm:py-14">
        <div className="scroll-mt-28" id="proximas-oportunidades">
          <CertificateRecommendations emphasized recommendations={recommendations} />
        </div>
        <CertificateAccountCallout accountHref={accountHref} accountLabel={accountLabel} />
      </div>
    </div>
  );
}
