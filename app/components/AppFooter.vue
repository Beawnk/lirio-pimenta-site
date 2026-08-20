<script setup>
import { computed } from 'vue'
import {
  ADDRESS,
  FACEBOOK_URL,
  INSTAGRAM,
  MAPS_URL,
  PHONE,
  PHONE_LABEL,
  WHATSAPP_LABEL,
} from '~/data/store-info'
import { useWhatsApp } from '~/composables/useWhatsApp'

const { waLink } = useWhatsApp()
const year = computed(() => new Date().getFullYear())
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="#top" class="brand">
            <span class="brand-mark"><img src="/img/logo.webp" alt="Lírio Pimenta" ></span>
            <span class="brand-text"><b>Lírio Pimenta</b><span>Vem ver</span></span>
          </a>
          <p>
            Mais de 40 anos ao lado do povo de Viamão. Presentes, brinquedos, livraria, tabacaria,
            utilidades, semijoias e muito mais.
          </p>
          <div class="social">
            <a :href="INSTAGRAM" target="_blank" rel="noopener" aria-label="Instagram">
              <IconInstagram />
            </a>
            <a
              v-if="FACEBOOK_URL"
              :href="FACEBOOK_URL"
              target="_blank"
              rel="noopener"
              aria-label="Facebook"
            >
              <IconFacebook />
            </a>
            <a :href="waLink()" target="_blank" rel="noopener" aria-label="WhatsApp">
              <IconWhatsApp />
            </a>
          </div>
        </div>

        <div>
          <h4>Loja</h4>
          <ul>
            <li>{{ ADDRESS.street }}</li>
            <li>{{ ADDRESS.district }} — {{ ADDRESS.city }}/{{ ADDRESS.state }}</li>
            <li><a :href="MAPS_URL" target="_blank" rel="noopener">Ver no mapa →</a></li>
          </ul>
        </div>

        <div>
          <h4>Atendimento</h4>
          <ul>
            <li><a :href="`tel:${PHONE}`">{{ PHONE_LABEL }}</a></li>
            <li>WhatsApp:</li>
            <li>
              <a :href="waLink()" target="_blank" rel="noopener">{{ WHATSAPP_LABEL }}</a>
            </li>
          </ul>
        </div>

        <div>
          <h4>Horário</h4>
          <ul>
            <li>Seg a qua: 09:00–18:30</li>
            <li>Qui a sáb: 08:30–18:30</li>
            <li>Domingo: fechado</li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© {{ year }} Lírio Pimenta — Viamão/RS. Todos os direitos reservados.</span>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  background: var(--ink-900);
  color: #c3ced6;
  padding: var(--sp-9) 0 0;

  h4 {
    color: #fff;
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 16px;
  }

  a {
    color: #c3ced6;
    transition: 0.16s;

    &:hover {
      color: var(--gold-500);
    }
  }

  p {
    font-size: 0.9rem;
    line-height: 1.7;
    margin-top: 14px;
    max-width: 34ch;
  }

  li {
    padding: 5px 0;
    font-size: 0.9rem;
  }
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 36px;
  padding-bottom: var(--sp-7);
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.brand-text {
  line-height: 1;

  b {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.12rem;
    color: #fff;
    display: block;
  }

  span {
    font-size: 0.66rem;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: var(--gold-500);
    font-weight: 600;
  }
}

.social {
  display: flex;
  gap: 10px;
  margin-top: 16px;

  a {
    width: 42px;
    height: 42px;
    border-radius: 11px;
    background: rgba(255, 255, 255, 0.08);
    display: grid;
    place-items: center;
    color: #fff;
    transition: 0.2s;

    &:hover {
      background: var(--blue-700);
      transform: translateY(-2px);
    }
  }

  svg {
    width: 20px;
    height: 20px;
  }
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 22px 0;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 0.82rem;
  color: var(--ink-300);
}

@media (max-width: 1024px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 26px;
  }
}
</style>
