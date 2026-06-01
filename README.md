# 🏛️ CidadeAlerta

> Plataforma Móvel de Fiscalização Urbana Cidadã com Inteligência Artificial

[![React Native](https://img.shields.io/badge/React_Native-Expo-blue)](https://expo.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange)](https://firebase.google.com)
[![Gemini AI](https://img.shields.io/badge/IA-Gemini_API-green)](https://ai.google.dev)
[![ODS 11](https://img.shields.io/badge/ODS-11_Cidades_Sustentáveis-gold)](https://odsbrasil.gov.br)

---

## 📋 Sobre o Projeto

O **CidadeAlerta** é uma plataforma móvel que permite ao cidadão registrar ocorrências urbanas (buracos, iluminação pública quebrada, descarte irregular de lixo, alagamentos, árvores em risco) com foto e GPS.

A aplicação utiliza **Inteligência Artificial (Gemini API)** para classificar automaticamente o tipo e a gravidade do problema, e exibe os dados em um mapa colaborativo acessível à comunidade e gestores públicos.

Desenvolvido como trabalho acadêmico da disciplina **ESOFT — Engenharia de Software** (7º semestre), **UniCesumar 2026.1**, alinhado à **ODS 11 da ONU** — Cidades e Comunidades Sustentáveis.

---

## 🎯 Funcionalidades

- 📷 Registro de ocorrências com câmera ou galeria
- 🤖 Classificação automática por IA (categoria + gravidade)
- 📍 Captura de localização GPS
- 🗺️ Mapa interativo com pins coloridos por gravidade
- 🔄 Ciclo de vida modelado como Autômato Finito Determinístico
- 📋 Histórico de tramitação de cada ocorrência
- ☁️ Persistência em tempo real com Firebase Firestore

---

## 🤖 Inteligência Artificial

A classificação usa a **Gemini 1.5 Flash API** (Google). Ao fotografar um problema, o app envia a imagem em base64 para o Gemini, que retorna:

```json
{
  "categoria": "Buraco na via",
  "gravidade": "Alta",
  "descricao": "Buraco profundo no asfalto em via movimentada"
}
```

Categorias suportadas:
- Buraco na via
- Iluminação pública
- Descarte irregular de lixo
- Alagamento
- Árvore em risco
- Calçada danificada
- Outro

---

## 🔄 Modelagem de Estados (Autômato Finito)

O ciclo de vida de cada ocorrência é modelado como um **Autômato Finito Determinístico (AFD)**:

```
NOVO → EM ANÁLISE → EM ANDAMENTO → RESOLVIDO → ARQUIVADO
```

Transições válidas:
| Estado atual | Pode ir para |
|---|---|
| Novo | Em Análise, Arquivado |
| Em Análise | Em Andamento, Arquivado |
| Em Andamento | Resolvido, Arquivado |
| Resolvido | Arquivado |
| Arquivado | — (estado final) |

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| React Native + Expo | App mobile multiplataforma |
| Expo Router | Navegação por sistema de arquivos |
| Firebase Firestore | Banco de dados em tempo real |
| Gemini API (Google) | Classificação de imagens com IA |
| Expo Camera | Captura de fotos |
| Expo Location | Captura de GPS |
| Expo Image Picker | Seleção da galeria |
| React Native Maps | Mapa interativo |

---

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+
- Expo CLI
- Conta Firebase
- Chave da API Gemini

### Instalação

```bash
# Clone o repositório
git clone https://github.com/MatheusCampioto/cidade-alerta.git
cd cidade-alerta

# Instale as dependências
npm install

# Crie o arquivo .env na raiz
cp .env.example .env
# Preencha as variáveis com suas chaves
```

### Variáveis de ambiente (.env)

```
EXPO_PUBLIC_FIREBASE_API_KEY=sua_chave
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_id
EXPO_PUBLIC_FIREBASE_APP_ID=seu_app_id
EXPO_PUBLIC_GEMINI_API_KEY=sua_chave_gemini
```

### Executar

```bash
# Iniciar servidor de desenvolvimento
npx expo start

# Android (emulador ou dispositivo)
npx expo start --android

# Web (sem câmera e mapa)
npx expo start --web
```

---

## 📁 Estrutura do Projeto

```
cidade-alerta/
├── src/
│   ├── app/                    # Rotas (Expo Router)
│   │   ├── _layout.tsx         # Layout global e navegação
│   │   ├── index.tsx           # Tela inicial
│   │   ├── register.tsx        # Registrar ocorrência
│   │   ├── list.tsx            # Listar ocorrências
│   │   ├── detail.tsx          # Detalhe da ocorrência
│   │   └── map.tsx             # Mapa de ocorrências
│   ├── screens/                # Componentes de tela
│   │   ├── HomeScreen.jsx
│   │   ├── RegisterScreen.jsx
│   │   ├── ListScreen.jsx
│   │   ├── DetailScreen.jsx
│   │   └── MapScreen.jsx
│   ├── services/               # Integrações externas
│   │   ├── firebase.js         # Configuração Firebase
│   │   ├── gemini.js           # Integração Gemini API
│   │   └── occurrenceService.js # CRUD de ocorrências
│   └── models/
│       └── occurrenceStateMachine.js  # Autômato Finito
├── .env                        # Variáveis de ambiente (não versionado)
└── app.json                    # Configuração Expo
```

---

## 🌍 ODS 11 — Cidades e Comunidades Sustentáveis

O CidadeAlerta contribui diretamente para a **Meta 11.6** da ODS 11:

> *"Até 2030, reduzir o impacto ambiental negativo per capita das cidades, inclusive prestando especial atenção à qualidade do ar, gestão de resíduos municipais e outros."*

Ao empoderar o cidadão com uma ferramenta digital de fiscalização, o app aproxima a comunidade dos gestores públicos, acelerando a resolução de problemas urbanos.

---

## 👨‍💻 Autores

| Nome | RA |
|---|---|
| Matheus Felipe Campioto Catenacci | 22014137-2 |
| André Felipe Ferrari de Azevedo | 22120196-2 |

**UniCesumar — Engenharia de Software — 7º Semestre — 2026.1**