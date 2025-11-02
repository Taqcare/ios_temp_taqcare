
import React, { useState } from 'react';
import { Card } from './ui/card';
import { MessageSquare, HelpCircle, Package, Plus, ChevronDown, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { toast } from './ui/sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSupportChat } from '@/contexts/SupportChatContext';
import SupportChat from './SupportChat';

interface HelpSectionProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const HelpSection = ({ isOpen, onOpenChange }: HelpSectionProps) => {
  const { t } = useLanguage();
  const { hasUnreadMessages, markAsRead } = useSupportChat();
  const [showFaq, setShowFaq] = useState(false);
  const [showSupportChat, setShowSupportChat] = useState(false);

  const handleOpenChat = () => {
    setShowSupportChat(true);
    markAsRead();
    onOpenChange?.(false);
  };

  const helpItems = [
    {
      icon: (
        <div className="relative">
          <MessageSquare className="w-5 h-5" />
          {hasUnreadMessages && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
      ),
      title: t('help.startChat'),
      description: "Estamos trabalhando por aqui!",
      onClick: handleOpenChat,
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      title: t('help.faq'),
      description: t('help.faqDesc'),
      onClick: () => setShowFaq(true),
    },
    {
      icon: <Package className="w-5 h-5" />,
      title: "Rastrear Pedido",
      description: "Acompanhe sua entrega online",
      onClick: () => window.open('https://taqcare.com.br/a/rastreio', '_blank'),
    },
  ];

  const faqCategories = [
    {
      title: "📦 Frete e Entrega",
      questions: [
        {
          question: "Por que meu produto demora até 14 dias para chegar?",
          answer: "Nosso prazo de entrega varia entre 7 a 14 dias úteis para o frete grátis e 3 a 10 dias úteis para o frete expresso. A Taqcare tem uma alta demanda de pedidos, e todos os nossos envios são internacionais, o que pode influenciar no prazo. Mas não se preocupe, garantimos que sua encomenda chegará com segurança!"
        },
        {
          question: "De onde o produto vem?",
          answer: "Nossos produtos são enviados diretamente da Alemanha, onde temos nossa central de distribuição. O frete é internacional e todas as taxas alfandegárias são cobertas pela nossa empresa. Se você receber alguma notificação de pagamento extra do correio ou de outra plataforma, não realize nenhum pagamento sem antes nos avisar. Estamos aqui para te ajudar!"
        },
        {
          question: "Meu pedido foi taxado. O que devo fazer?",
          answer: "Se sua compra for taxada, não se preocupe! Todas as taxas são cobertas pela Taqcare. Caso receba qualquer cobrança adicional, entre em contato com nosso suporte antes de realizar qualquer pagamento. Nós resolveremos tudo para você."
        },
        {
          question: "Como posso rastrear meu pedido?",
          answer: "Assim que seu pedido for enviado, você receberá um e-mail com o código de rastreamento. Você pode acompanhar sua entrega pela nossa página de rastreamento: Clicando aqui. Caso tenha dúvidas, nosso suporte está disponível para te ajudar!"
        },
        {
          question: "O código de rastreamento não está atualizando. O que faço?",
          answer: "Isso pode acontecer por conta do tempo de atualização do sistema de rastreamento. Pedimos que aguarde alguns dias, pois o status geralmente se atualiza automaticamente. Se passar um período maior e o código continuar sem movimentação, entre em contato com nosso suporte para que possamos verificar a situação! 😊"
        }
      ]
    },
    {
      title: "🔍 Produto",
      questions: [
        {
          question: "O IPL Pro da Taqcare funciona em todos os tipos de pele?",
          answer: "Nosso IPL é eficaz para a maioria dos tons de pele e cores de pelos. No entanto, como qualquer tecnologia IPL, ele pode ter menor eficácia em pelos muito claros (loiros, grisalhos ou ruivos) e em peles muito escuras. Para garantir que o aparelho seja ideal para você, consulte nossa tabela de compatibilidade antes da compra: Clicando aqui."
        },
        {
          question: "O uso do IPL dói?",
          answer: "Não! Diferente da depilação com cera ou do laser tradicional, o IPL Pro da Taqcare é suave e confortável. A sensação pode variar de pessoa para pessoa, mas a maioria dos usuários descreve apenas um leve aquecimento na pele durante o uso. Além disso, nosso aparelho possui níveis ajustáveis de intensidade para maior conforto."
        },
        {
          question: "Preciso raspar os pelos antes de usar o IPL?",
          answer: "Sim! Para obter os melhores resultados, é fundamental remover os pelos antes da sessão. Não use cera ou pinça, apenas lâmina ou creme depilatório. Isso evita que os pelos absorvam a luz do IPL, garantindo uma aplicação eficaz e segura."
        },
        {
          question: "Em quanto tempo começo a ver resultados?",
          answer: "Os primeiros resultados aparecem entre 3 a 4 semanas de uso regular. A partir da 8ª semana, a redução dos pelos se torna mais visível. O tempo pode variar conforme o tipo de pele e pelo, mas a consistência no uso é essencial para alcançar o resultado desejado."
        },
        {
          question: "O IPL Pro é seguro para áreas sensíveis, como rosto e virilha?",
          answer: "Sim! O IPL Pro da Taqcare pode ser usado com segurança em áreas sensíveis, como rosto, axilas e virilha. Recomendamos ajustar a intensidade para um nível mais baixo nessas regiões e sempre seguir as instruções do cronograma personalizado."
        },
        {
          question: "Preciso usar algum produto antes ou depois do IPL?",
          answer: "Sim! Para um cuidado completo e melhores resultados:\n• Antes do IPL: Aplique o Dewy, nosso gel restaurador para hidratar e proteger a pele.\n• Depois do IPL: Aplique o Hydry, nosso creme hidratante para acalmar e nutrir a pele, evitando irritações."
        }
      ]
    },
    {
      title: "🏬 Loja e Pagamentos",
      questions: [
        {
          question: "Quais formas de pagamento são aceitas?",
          answer: "Aceitamos cartões de crédito e débito (Visa, Mastercard, Elo, Amex) e Pix. Para maior praticidade, também oferecemos a opção de parcelamento no cartão."
        },
        {
          question: "Posso parcelar minha compra?",
          answer: "Sim! Você pode parcelar sua compra em até 2x sem juros no cartão de crédito. Para parcelamentos acima de 2 vezes, é possível dividir em até 10x com juros. O número de parcelas e as taxas aplicáveis serão informados no momento do checkout."
        },
        {
          question: "Meu pagamento não foi aprovado, o que fazer?",
          answer: "Se seu pagamento não foi aprovado, verifique se:\n• O limite do seu cartão é suficiente;\n• Os dados do cartão foram inseridos corretamente;\n• O banco não bloqueou a transação por segurança.\nCaso o problema persista, tente outra forma de pagamento ou entre em contato com a administradora do seu cartão."
        },
        {
          question: "Posso alterar ou cancelar um pedido após a compra?",
          answer: "Caso precise alterar ou cancelar um pedido, entre em contato com nosso suporte o mais rápido possível. Se o pedido já tiver sido enviado, não será possível cancelá-lo, mas você pode solicitar a devolução assim que recebê-lo."
        }
      ]
    },
    {
      title: "🔄 Trocas, Devoluções e Garantia",
      questions: [
        {
          question: "Como funciona a política de devolução?",
          answer: "Nós acreditamos tanto na qualidade dos nossos produtos que oferecemos 100 dias para testes! Você pode experimentar o produto com calma e, se não estiver satisfeita, poderá devolvê-lo dentro desse período. Ao contrário de outras marcas que oferecem apenas 14 dias, nós queremos que você tenha a confiança de que o nosso produto vai realmente atender às suas expectativas."
        },
        {
          question: "Como funciona o processo de troca?",
          answer: "Se o produto apresentar defeito ou não atender suas expectativas dentro de 100 dias, basta entrar em contato conosco: Clicando aqui. Nós garantimos a troca ou o reembolso integral do seu valor. Para realizar a troca, preencha o formulário e aguarde o contato da nossa equipe."
        },
        {
          question: "A devolução tem custo?",
          answer: "Não! O custo de devolução do produto é por nossa conta, então você não terá que pagar nada. Enviaremos as instruções de devolução por WhatsApp, e você poderá enviar o produto de volta sem custos adicionais."
        },
        {
          question: "Como funciona a garantia do meu produto?",
          answer: "Na Taqcare, oferecemos 100 dias de teste sem risco, onde você pode experimentar o produto com toda a confiança. Além disso, todos os nossos produtos têm garantia de 2 anos de fabricante, que cobre danos ou falhas de fabricação. Porém, a garantia de fabricante só se aplica em casos de defeitos ou danos no produto, como quebra ou falhas mecânicas. Se o produto não apresentar problemas de fabricação, a devolução será tratada dentro dos 100 dias de teste."
        },
        {
          question: "Como posso garantir que estou fazendo uma devolução corretamente?",
          answer: "Siga esses passos para garantir que sua devolução seja processada de forma eficiente:\n1. Preencha o formulário de devolução na nossa página: Clicando aqui.\n2. Aguarde a nossa equipe de atendimento entrar em contato via WhatsApp.\n3. Envie o produto de volta, com um vídeo mostrando o estado do item ao chegar em sua casa.\n4. Após a chegada do produto na nossa central, você receberá o reembolso ou a troca conforme sua solicitação."
        }
      ]
    },
    {
      title: "📲 Atendimento e Contato",
      questions: [
        {
          question: "Quanto tempo demora para responderem ao meu contato?",
          answer: "Nosso atendimento está disponível 24 horas por dia, todos os dias. Sempre que precisar de ajuda, basta nos enviar uma mensagem e responderemos o mais rápido possível!"
        },
        {
          question: "Posso tirar dúvidas sobre o uso dos produtos?",
          answer: "Claro! Nossa equipe está preparada para responder a todas as suas dúvidas sobre o uso dos produtos, cuidados, e como garantir os melhores resultados com o IPL e outros itens. Basta nos enviar sua pergunta pelo WhatsApp ou por e-mail, e te ajudaremos com um passo a passo detalhado!"
        },
        {
          question: "Como posso sugerir melhorias ou novos produtos?",
          answer: "Adoramos ouvir nossas clientes e sempre estamos em busca de melhorar nossos produtos e serviços! Envie suas sugestões pelo WhatsApp ou pelo e-mail, e nossa equipe avaliará com muito carinho."
        }
      ]
    }
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-sm sm:max-w-md md:max-w-lg rounded-xl shadow-lg overflow-y-auto max-h-[85vh]">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-200">
              {showFaq ? (
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mr-2 p-0 h-8 w-8 dark:hover:bg-gray-700"
                    onClick={() => setShowFaq(false)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  {t('help.frequentQuestions')}
                </div>
              ) : (
                t('help.howCanWeHelp')
              )}
            </DialogTitle>
          </DialogHeader>
          
          {!showFaq ? (
            <div className="space-y-3 mt-3">
              {helpItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer border border-gray-100 dark:border-gray-600 shadow-sm"
                  onClick={item.onClick}
                >
                  <div className="text-primary bg-primary/10 dark:bg-primary/20 p-2 rounded-full">{item.icon}</div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200">{item.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {faqCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="rounded-lg bg-gray-50 dark:bg-gray-700 p-4">
                  <h3 className="text-md font-semibold mb-2 dark:text-gray-200">{category.title}</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`} className="border-b border-gray-200 dark:border-gray-600 last:border-0">
                        <AccordionTrigger className="py-3 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 pb-3 pt-1 whitespace-pre-line">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <SupportChat 
        isOpen={showSupportChat} 
        onClose={() => {
          setShowSupportChat(false);
          markAsRead();
        }}
      />
    </>
  );
};

export default HelpSection;
