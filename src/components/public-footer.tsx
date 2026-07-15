import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { AbcunaBrand } from "./abcuna-brand";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-foreground/5 border-t border-border/50 mt-20">
      {/* Main Footer Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <AbcunaBrand size="md" />
            <p className="text-sm text-muted-foreground max-w-xs">
              Associação de Bombeiros Civis de Uiraúna - Sistema Integrado de Gestão Administrativa.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Menu</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  to="/quem-somos"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link
                  to="/cursos"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Cursos
                </Link>
              </li>
              <li>
                <Link
                  to="/eventos"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Eventos
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Serviços</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/cursos"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Primeiros Socorros
                </Link>
              </li>
              <li>
                <Link
                  to="/cursos"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Brigada
                </Link>
              </li>
              <li>
                <Link
                  to="/eventos"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Eventos
                </Link>
              </li>
              <li>
                <Link
                  to="/contato"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Consultorias
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contato</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Uiraúna, Paraíba, Brasil</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="tel:+558332123456" className="hover:text-primary transition-colors">
                  +55 (83) 3212-3456
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="mailto:contato@abcuna.org" className="hover:text-primary transition-colors">
                  contato@abcuna.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* Bottom Section */}
        <div className="mt-8 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p>© {currentYear} ABCUNA. Todos os direitos reservados.</p>
          </div>
          <div className="flex items-center justify-start sm:justify-end gap-6">
            <Link
              to="/politica-de-privacidade"
              className="hover:text-primary transition-colors"
            >
              Política de Privacidade
            </Link>
            <Link
              to="/termos-de-uso"
              className="hover:text-primary transition-colors"
            >
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
