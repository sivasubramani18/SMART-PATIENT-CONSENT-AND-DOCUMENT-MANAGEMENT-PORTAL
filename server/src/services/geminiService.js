import { GoogleGenerativeAI } from '@google/generative-ai';

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim().length > 0) {
    return new GoogleGenerativeAI(apiKey.trim());
  }
  return null;
}

const AI_DISCLAIMER =
  'AI-generated explanation for understanding only. It does not replace advice from a qualified healthcare professional. Always consult your attending physician regarding personal medical questions.';

const PREFERRED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-1.5-flash'
];

async function generateWithAvailableModel(genAI, prompt) {
  let lastError = null;
  for (const modelName of PREFERRED_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      lastError = err;
      if (
        err.message &&
        (err.message.includes('404') ||
          err.message.includes('not found') ||
          err.message.includes('503') ||
          err.message.includes('high demand'))
      ) {
        continue; // Try next model name in candidate list
      }
      throw err;
    }
  }
  throw lastError;
}

/**
 * Explains medical consent in plain, patient-friendly language while preserving clinical facts.
 * Adheres strictly to Section 1, 19, and 45 safety guidelines.
 */
export async function explainConsentWithAI(consentData) {
  const prompt = `You are a medical consent communication specialist.
Your goal is to help a patient understand their upcoming clinical consent form in simple, compassionate, and clear non-medical language.

IMPORTANT SAFETY INSTRUCTIONS:
1. Preserve factual meaning accurately.
2. Explain medical terminology in everyday language.
3. DO NOT DIAGNOSE.
4. DO NOT RECOMMEND TREATMENT OR ADVISE WHETHER TO SIGN.
5. DO NOT MODIFY, OMIT, OR MINIMIZE ANY RISKS OR COMPLICATIONS.
6. Clearly distinguish original content from your explanation.
7. Emphasize that the patient must consult their doctor for personal medical advice.

CONSENT INFORMATION:
- Procedure: ${consentData.procedure}
- Clinical Purpose: ${consentData.purpose}
- Procedure Description: ${consentData.description}
- Expected Benefits: ${(consentData.benefits || []).join(', ')}
- Known Risks & Potential Complications: ${(consentData.risks || []).join(', ')}
- Alternatives Considered: ${(consentData.alternatives || []).join(', ')}

Please provide a structured response in plain English with:
1. In Plain English: What this procedure actually is and why it's done.
2. What You Can Expect: What will happen during the procedure.
3. Key Benefits: Why the doctor is recommending this.
4. Things You Should Be Aware Of (Risks): Honest explanation of possible complications in everyday terms.
5. Other Options: What other medically valid choices exist.`;

  const genAI = getGenAI();
  if (genAI) {
    try {
      const text = await generateWithAvailableModel(genAI, prompt);
      return {
        success: true,
        source: 'GEMINI_AI',
        explanation: text,
        disclaimer: AI_DISCLAIMER
      };
    } catch (err) {
      console.warn('[Gemini API Call Error]:', err.message);
      // Fall through to deterministic high-yield clinical translation
    }
  }

  // High-yield fallback explanation for development/offline mode
  const fallbackExplanation = `### In Plain English: What This Procedure Is
You are scheduled for **${consentData.procedure}**. In simple terms, this means:
- **Why it is done:** ${consentData.purpose}
- **What happens:** ${consentData.description}

### What to Expect During the Treatment
Your surgical and care team will ensure you are comfortable throughout. If general anesthesia is used, you will be asleep and will not feel pain during the procedure. Small incisions or specialized instruments may be used to minimize tissue trauma and promote faster healing.

### Expected Benefits
The main goals of this procedure are:
${(consentData.benefits || []).map((b) => `- **${b}**`).join('\n')}

### Risks & What You Should Know
Like any medical procedure, there are potential risks you should be aware of:
${(consentData.risks || []).map((r) => `- **${r}**: Talk to your physician about the likelihood and precautions taken.`).join('\n')}

### Other Choices (Alternatives)
Other options discussed by your doctor include:
${(consentData.alternatives || []).map((a) => `- ${a}`).join('\n')}`;

  return {
    success: true,
    source: 'CLINICAL_SIMPLIFICATION_ENGINE',
    explanation: fallbackExplanation,
    disclaimer: AI_DISCLAIMER
  };
}

/**
 * Explains a specific highlighted medical term in simple analogies (Section 20)
 */
export async function explainMedicalTerm(term, context = '') {
  const prompt = `Explain the following medical term in 1-2 simple, easy-to-understand sentences for a patient reading their consent form.
Term: "${term}"
Context: "${context}"

Safety rules:
- Do NOT provide personalized medical advice.
- Explain the definition plainly with everyday language or a helpful analogy.
- Keep explanation under 50 words.`;

  const genAI = getGenAI();
  if (genAI) {
    try {
      const text = await generateWithAvailableModel(genAI, prompt);
      return {
        success: true,
        term,
        explanation: text.trim(),
        disclaimer: AI_DISCLAIMER
      };
    } catch (err) {
      console.warn('[Gemini Term API Error]:', err.message);
    }
  }

  // Built-in clinical terminology dictionary fallback
  const termDictionary = {
    laparoscopic: 'Laparoscopic means a procedure performed using small keyhole openings and a tiny camera rather than one large surgical cut, enabling quicker recovery.',
    anesthesia: 'Anesthesia is medicine given to prevent you from feeling pain during surgery. General anesthesia keeps you completely asleep throughout the procedure.',
    cholecystectomy: 'Cholecystectomy is the surgical removal of the gallbladder, usually performed because gallstones are causing pain or inflammation.',
    calculi: 'Calculi is the medical term for stones (such as gallstones or kidney stones) formed by crystallized substances.',
    hematoma: 'A hematoma is a localized collection of blood outside blood vessels, similar to a deep bruise, that usually heals over time.',
    anaphylaxis: 'Anaphylaxis is an acute, severe allergic reaction that healthcare teams are trained and equipped to treat immediately.',
    endoscopy: 'Endoscopy is a procedure where a doctor uses a thin, flexible tube with a camera to examine the inside of your body without surgery.',
    polypectomy: 'Polypectomy is the gentle removal of a polyp (a small growth of tissue) during a scope procedure so it can be examined in the lab.'
  };

  const normalized = term.toLowerCase().trim();
  const matched = termDictionary[normalized] || `"${term}" is a clinical term referring to specific medical anatomy, pathology, or technique used in your care. Please ask your physician to explain how it specifically applies to your case.`;

  return {
    success: true,
    term,
    explanation: matched,
    disclaimer: AI_DISCLAIMER
  };
}

/**
 * Generates 2-3 simple comprehension check questions based ONLY on the consent text (Section 22)
 */
export async function generateComprehensionQuestions(consentData) {
  const genAI = getGenAI();
  if (genAI) {
    try {
      const prompt = `Based ONLY on the following consent details, generate 2 simple multiple-choice comprehension questions to help the patient verify they reviewed the key facts.
Return strictly valid JSON with an array named "questions" containing:
{
  "questions": [
    {
      "id": 1,
      "question": "What is the primary purpose of this procedure?",
      "options": ["Option A", "Option B", "Option C"],
      "correctIndex": 0,
      "explanation": "Why this is correct"
    }
  ]
}

Consent:
Procedure: ${consentData.procedure}
Purpose: ${consentData.purpose}
Risks: ${(consentData.risks || []).join('; ')}`;

      const text = await generateWithAvailableModel(genAI, prompt);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.questions) {
          return {
            success: true,
            questions: parsed.questions,
            disclaimer: 'This comprehension check is an educational assistance feature and does not constitute a legal assessment of capacity.'
          };
        }
      }
    } catch (err) {
      console.warn('[Gemini Quiz Error]:', err.message);
    }
  }

  // Reliable fallback questions grounded in consent data
  const fallbackQuestions = [
    {
      id: 1,
      question: `What is the main procedure described in this consent agreement?`,
      options: [
        consentData.procedure,
        'Routine Dental Cleaning',
        'Physical Therapy Evaluation'
      ],
      correctIndex: 0,
      explanation: `The scheduled procedure is ${consentData.procedure}.`
    },
    {
      id: 2,
      question: `Which of the following is identified as a potential risk or complication?`,
      options: [
        consentData.risks?.[0] || 'Postoperative infection or bleeding',
        'Immediate permanent immunity to all illnesses',
        'Complete guarantee of zero recovery time'
      ],
      correctIndex: 0,
      explanation: `Every medical procedure carries known risks such as ${consentData.risks?.[0] || 'infection or bleeding'}, which your doctor takes precautions to minimize.`
    }
  ];

  return {
    success: true,
    questions: fallbackQuestions,
    disclaimer: 'This comprehension check is an educational assistance feature and does not constitute a legal assessment of decision-making capacity.'
  };
}
