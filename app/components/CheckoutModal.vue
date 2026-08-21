<script setup>
import { computed, reactive, ref } from 'vue'
import { ADDRESS } from '~/data/store-info'
import { useCartStore } from '~/stores/cart'
import { useToastStore } from '~/stores/toast'
import { useUiStore } from '~/stores/ui'
import { useWhatsApp } from '~/composables/useWhatsApp'

/* Dois passos, não os cinco da demo: aqui não existe pedido para processar.
   O site só monta a mensagem e entrega a conversa para a loja. */
const cart = useCartStore()
const ui = useUiStore()
const toast = useToastStore()
const { waLink } = useWhatsApp()

const STEPS = ['Seu pedido', 'Seus dados']
const step = ref(1)

const customer = reactive({ name: '', phone: '', method: 'retirada', notes: '' })

const canSend = computed(() => customer.name.trim() && customer.phone.trim())
const orderLink = computed(() => waLink(cart.orderMessage(customer)))

function send() {
  /* Deixa o carrinho como está: só quem enviou a mensagem sabe se enviou
     mesmo, e apagar a seleção de quem desistiu no meio seria pior. */
  ui.close()
  step.value = 1
  toast.show('Pedido aberto no WhatsApp')
}
</script>

<template>
  <div
    class="modal"
    :class="{ show: ui.isOpen('checkout') }"
    role="dialog"
    aria-modal="true"
    aria-label="Enviar pedido"
  >
    <div class="modal-card">
      <div class="steps">
        <template v-for="(label, i) in STEPS" :key="label">
          <div class="step" :class="{ active: step === i + 1, done: step > i + 1 }">
            <span class="n"><IconCheck v-if="step > i + 1" /><template v-else>{{ i + 1 }}</template></span>
            {{ label }}
          </div>
          <span v-if="i < STEPS.length - 1" class="step-line" />
        </template>
      </div>

      <div class="co-body">
        <template v-if="step === 1">
          <h3>Seu pedido</h3>
          <div class="review-box">
            <div v-for="line in cart.lines" :key="line.id" class="rl">
              <span>{{ line.qty }}× {{ line.product.name }}</span>
              <b>{{ line.product.available ? 'Disponível' : 'Sob consulta' }}</b>
            </div>
          </div>
          <p class="nota">
            O valor é combinado no WhatsApp, junto com a retirada ou a entrega.
          </p>
        </template>

        <template v-else>
          <h3>Seus dados</h3>
          <div class="field">
            <label for="coName">Nome *</label>
            <input id="coName" v-model="customer.name" placeholder="Como podemos te chamar?" >
          </div>
          <div class="field">
            <label for="coPhone">Telefone / WhatsApp *</label>
            <input id="coPhone" v-model="customer.phone" placeholder="(51) 9...." >
          </div>

          <label class="radio-card" :class="{ sel: customer.method === 'retirada' }">
            <input v-model="customer.method" type="radio" value="retirada" >
            <div>
              <b>Retirar na loja</b>
              <p>{{ ADDRESS.full }}</p>
            </div>
          </label>
          <label class="radio-card" :class="{ sel: customer.method === 'entrega' }">
            <input v-model="customer.method" type="radio" value="entrega" >
            <div>
              <b>Consultar entrega</b>
              <p>A gente combina a entrega e o valor direto com você.</p>
            </div>
          </label>

          <div class="field">
            <label for="coNotes">Observações (opcional)</label>
            <textarea id="coNotes" v-model="customer.notes" rows="2" placeholder="Alguma preferência ou dúvida?" />
          </div>

          <p class="nota">
            Usamos só para combinar a retirada ou a entrega. Nada é enviado para o site.
          </p>
        </template>
      </div>

      <div class="co-foot">
        <button v-if="step === 1" class="btn btn-ghost" @click="ui.open('cart')">Voltar</button>
        <button v-else class="btn btn-ghost" @click="step = 1">Voltar</button>

        <button v-if="step === 1" class="btn btn-primary" @click="step = 2">Avançar</button>
        <a
          v-else
          :href="canSend ? orderLink : undefined"
          :class="['btn', 'btn-wa', { disabled: !canSend }]"
          target="_blank"
          rel="noopener"
          @click="canSend && send()"
        >
          <IconWhatsApp class="ic" />
          Enviar no WhatsApp
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  padding: 20px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s, visibility 0.3s;

  &.show {
    opacity: 1;
    visibility: visible;

    .modal-card {
      transform: none;
    }
  }
}

.modal-card {
  background: #fff;
  border-radius: var(--r-xl);
  width: min(560px, 100%);
  max-height: 92vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--sh-3);
  transform: translateY(16px) scale(0.98);
  transition: transform 0.32s var(--ease);
}

.steps {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 0.82rem;
  color: var(--ink-300);

  .n {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--bg-soft);
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 0.8rem;
    transition: 0.2s;

    svg {
      width: 14px;
      height: 14px;
    }
  }

  &.active {
    color: var(--blue-700);

    .n {
      background: var(--blue-700);
      color: #fff;
    }
  }

  &.done .n {
    background: var(--ok);
    color: #fff;
  }
}

.step-line {
  flex: 1;
  height: 2px;
  background: var(--line);
  min-width: 12px;
}

.co-body {
  padding: 24px;
  overflow-y: auto;

  h3 {
    margin-bottom: 14px;
    font-size: 1.15rem;
  }
}

.review-box {
  background: var(--bg-soft);
  border-radius: var(--r-md);
  padding: 18px;

  .rl {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 0.9rem;
    padding: 6px 0;

    b {
      font-family: var(--font-display);
      color: var(--ink-500);
      white-space: nowrap;
    }
  }
}

.nota {
  font-size: 0.82rem;
  color: var(--ink-500);
  margin-top: 12px;
}

.field {
  margin-bottom: 16px;

  label {
    display: block;
    font-family: var(--font-display);
    font-weight: 500;
    font-size: 0.85rem;
    margin-bottom: 6px;
  }

  input,
  textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1.6px solid var(--line);
    border-radius: var(--r-md);
    font-family: var(--font-text);
    font-size: 0.95rem;
    transition: 0.18s;

    &:focus {
      outline: none;
      border-color: var(--blue-500);
      box-shadow: 0 0 0 4px rgba(31, 122, 176, 0.1);
    }
  }
}

.radio-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 16px;
  border: 1.8px solid var(--line);
  border-radius: var(--r-md);
  cursor: pointer;
  transition: 0.18s;
  margin-bottom: 12px;

  &:hover {
    border-color: var(--blue-500);
  }

  &.sel {
    border-color: var(--blue-700);
    background: var(--blue-100);
  }

  input {
    margin-top: 3px;
    accent-color: var(--blue-700);
    width: 18px;
    height: 18px;
  }

  b {
    font-family: var(--font-display);
    font-size: 0.95rem;
  }

  p {
    font-size: 0.83rem;
    color: var(--ink-500);
    margin-top: 3px;
  }
}

.co-foot {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 24px;
  border-top: 1px solid var(--line);
  background: var(--bg-soft);

  .ic {
    width: 18px;
    height: 18px;
  }

  .disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}
</style>
