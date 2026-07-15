import { createFileRoute } from "@tanstack/react-router";
import { Section, SectionContainer, SectionTitle } from "@/components/public-section";

export const Route = createFileRoute("/_public/politica-de-privacidade")({
  component: PrivacyPolicyPage,
  head: () => ({
    meta: [
      {
        title: "Política de Privacidade - ABCUNA",
      },
    ],
  }),
});

function PrivacyPolicyPage() {
  return (
    <div className="w-full">
      <Section className="bg-gradient-to-br from-primary/5 to-background py-16">
        <SectionContainer>
          <SectionTitle title="Política de Privacidade" />
        </SectionContainer>
      </Section>

      <Section>
        <SectionContainer className="max-w-3xl prose dark:prose-invert prose-sm">
          <div className="space-y-8 text-foreground">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">1. Introdução</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Associação de Bombeiros Civis de Uiraúna (ABCUNA) respeita sua privacidade e está comprometida
                em ser transparente sobre como coletamos, usamos e protegemos seus dados pessoais. Esta Política de
                Privacidade explica nossas práticas de privacidade.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">2. Informações que Coletamos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Coletamos informações que você nos fornece diretamente, incluindo:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Nome completo, CPF e data de nascimento</li>
                <li>Endereço de e-mail e telefone</li>
                <li>Informações de login e senha</li>
                <li>Histórico de cursos e certificações</li>
                <li>Informações de pagamento (quando aplicável)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">3. Como Usamos Seus Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos as informações coletadas para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Gerenciar sua conta e acesso ao portal</li>
                <li>Processar inscrições em cursos e eventos</li>
                <li>Emitir certificados e credenciais</li>
                <li>Comunicar informações importantes sobre nossos serviços</li>
                <li>Melhorar nossos serviços e experiência do usuário</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">4. Proteção de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado,
                alteração, divulgação ou destruição. Todos os dados são armazenados em servidores seguros com criptografia
                end-to-end.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">5. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Não compartilhamos seus dados pessoais com terceiros sem seu consentimento explícito, exceto quando
                exigido por lei ou para fins operacionais essenciais do serviço.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">6. Seus Direitos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Você tem direito a:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados imprecisos</li>
                <li>Solicitar exclusão de dados</li>
                <li>Revogar consentimento a qualquer momento</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">7. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para questões sobre privacidade, entre em contato conosco em: contato@abcuna.org
              </p>
            </section>

            <section className="space-y-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Última atualização: Julho de 2024
              </p>
            </section>
          </div>
        </SectionContainer>
      </Section>
    </div>
  );
}
