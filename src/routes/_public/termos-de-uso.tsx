import { createFileRoute } from "@tanstack/react-router";
import { Section, SectionContainer, SectionTitle } from "@/components/public-section";

export const Route = createFileRoute("/_public/termos-de-uso")({
  component: TermsPage,
  head: () => ({
    meta: [
      {
        title: "Termos de Uso - ABCUNA",
      },
    ],
  }),
});

function TermsPage() {
  return (
    <div className="w-full">
      <Section className="bg-gradient-to-br from-primary/5 to-background py-16">
        <SectionContainer>
          <SectionTitle title="Termos de Uso" />
        </SectionContainer>
      </Section>

      <Section>
        <SectionContainer className="max-w-3xl prose dark:prose-invert prose-sm">
          <div className="space-y-8 text-foreground">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e usar a plataforma SIGA, você concorda em estar vinculado por estes Termos de Uso. Se
                você não concorda com qualquer parte destes termos, não use o serviço.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">2. Elegibilidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                Você confirma que:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>É maior de 18 anos</li>
                <li>Possui capacidade legal para celebrar contratos</li>
                <li>Usará o serviço apenas para fins lícitos</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">3. Conta e Segurança</h2>
              <p className="text-muted-foreground leading-relaxed">
                Você é responsável por manter a confidencialidade de suas credenciais de login. Qualquer atividade
                realizada sob sua conta é de sua responsabilidade. Notifique-nos imediatamente de qualquer uso não
                autorizado.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">4. Conteúdo do Usuário</h2>
              <p className="text-muted-foreground leading-relaxed">
                Você concede à ABCUNA o direito de usar, reproduzir e distribuir qualquer conteúdo que você enviar
                através da plataforma, desde que não seja feita venda ou distribuição comercial sem sua autorização.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">5. Restrições de Uso</h2>
              <p className="text-muted-foreground leading-relaxed">
                Você concorda em não:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Usar a plataforma para fins ilegais ou prejudiciais</li>
                <li>Tentar acessar áreas não autorizadas</li>
                <li>Interferir com o funcionamento da plataforma</li>
                <li>Transmitir vírus ou código malicioso</li>
                <li>Plagiar ou violar propriedade intelectual</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">6. Certificados e Credenciais</h2>
              <p className="text-muted-foreground leading-relaxed">
                Certificados emitidos pela ABCUNA são válidos mediante cumprimento de todos os requisitos dos cursos.
                A ABCUNA reserva o direito de revogar certificados em caso de fraude ou violação de condutas.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">7. Limite de Responsabilidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                A ABCUNA não é responsável por:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Perdas ou danos indiretos resultantes do uso ou impossibilidade de uso do serviço</li>
                <li>Perda de dados ou interrupção de serviço</li>
                <li>Conteúdo enviado por terceiros</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">8. Modificações e Interrupções</h2>
              <p className="text-muted-foreground leading-relaxed">
                A ABCUNA reserva o direito de modificar, suspender ou descontinuar o serviço, ou qualquer parte dele,
                a qualquer momento com ou sem aviso prévio.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">9. Lei Aplicável</h2>
              <p className="text-muted-foreground leading-relaxed">
                Estes Termos de Uso são regidos pela lei brasileira, especificamente a legislação do estado da Paraíba.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold">10. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para questões sobre estes termos, entre em contato: contato@abcuna.org
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
