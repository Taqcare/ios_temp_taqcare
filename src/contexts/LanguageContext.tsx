import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Navigation
    'nav.dashboard': 'Início',
    'nav.education': 'Educação',
    'nav.profile': 'Perfil',
    'nav.schedule': 'Agenda',
    
    // Dashboard
    'dashboard.hello': 'Olá',
    'dashboard.welcome': 'Bem-Vindo(a)',
    'dashboard.trackProgress': 'Acompanhe seu progresso',
    
    // Product descriptions (keeping original Portuguese ones)
    'product.iplpro.name': 'Ivi Air',
    'product.iplpro.description': 'Dispositivo de depilação a laser para uso doméstico',
    'product.hydry.name': 'Hydry',
    'product.hydry.description': 'Creme hidratante pós-IPL para acalmar a pele',
    'product.dewy.name': 'Dewy',
    'product.dewy.description': 'Gel refrescante pós-depilação com vitamina E',
    'product.sooth.name': 'Sooth',
    'product.sooth.description': 'Loção calmante para pele sensível após tratamento',
    'product.gloves.name': 'Luvas de esfoliação premium',
    'product.gloves.description': 'Para a limpeza profunda da pele',
    
    // Education Hub
    'education.title': 'Dicas Ivi Air',
    'education.subtitle': 'Aprenda como obter os melhores resultados dos seus tratamentos',
    'education.tutorialTitle': 'Tutorial Completo',
    'education.tutorialDesc': 'Assista ao vídeo acima para aprender como usar seu dispositivo Ivi Air de forma eficaz e segura.',
    'education.stepByStepTitle': 'Passo a Passo',
    'education.blogsTitle': 'Blogs Recomendados para um Bom Tratamento',
    'education.readBlog': 'Ler Blog',
    
    // Education Tips
    'education.tip1.title': 'Desembalagem e Ligação do Aparelho',
    'education.tip1.description': '📌 O aparelho vem bem embalado com: Ivi Air, óculos de segurança e carregador.\n📌 Retire a capinha protetora da saída dos flashes.\n📌 Conecte o cabo na tomada (o aparelho só funciona ligado à energia).\n📌 O Ivi Air dará um sinal e desligará. Para ligar, pressione e segure o botão lateral.',
    'education.tip2.title': 'Ajuste de Potência e Modos de Uso',
    'education.tip2.description': '📌 O Ivi Air possui potência ajustável pelo botão lateral. Para saber a potência ideal para sua pele, clique aqui.\n📌 Para ativação do flash:\n🔸 Modo manual: pressione o botão para emitir a luz pulsada.\n🔸 Modo automático: o aparelho detecta os pelos e dispara sozinho.\n📌 Para alternar os modos, segure o botão central.',
    'education.tip3.title': 'Segurança e Recomendações',
    'education.tip3.description': '📌 O aparelho é indolor, sem dor ou desconforto.\n📌 Uso obrigatório dos óculos de proteção para evitar danos pela luz pulsada.\n📌 Pode ser aplicado na maioria das áreas do corpo.\n📌 O produto inclui manual e instruções detalhadas na embalagem.',
    
    // Blog Posts
    'blog.post1.title': 'Por que a depilação IPL é ótima para conseguir o corpo liso dos seus sonhos',
    'blog.post2.title': 'Quais são os diferentes tipos de pelos pubianos?',
    'blog.post3.title': 'Depilação a laser IPL em casa: funciona mesmo?',
    'blog.post4.title': 'Com que Frequência Você Deve se Barbear? (Um Guia para Pernas, Axilas e Pelos Pubianos)',
    
    // Profile
    'profile.settings': 'Configurações',
    'profile.personalize': 'Personalize sua experiência no aplicativo',
    'profile.edit': 'Editar',
    'profile.user': 'Usuário',
    'profile.loading': 'Carregando...',
    'profile.emailLoading': 'Carregando email...',
    'profile.logout': 'Sair',
    'profile.endSession': 'Encerrar sessão atual',
    'profile.security': 'Segurança',
    'profile.privacy': 'Política de Privacidade',
    'profile.privacyDesc': 'Como protegemos seus dados',
    'profile.help': 'Central de Ajuda',
    'profile.helpDesc': 'Obtenha suporte e tire dúvidas',
    'profile.about': 'Sobre o App',
    
    // Edit Profile
    'editProfile.title': 'Editar Perfil',
    'editProfile.subtitle': 'Atualize suas informações pessoais',
    'editProfile.back': 'Voltar',
    'editProfile.personalInfo': 'Informações Pessoais',
    'editProfile.firstName': 'Nome',
    'editProfile.lastName': 'Sobrenome',
    'editProfile.email': 'Email',
    'editProfile.emailReadonly': 'O email não pode ser alterado.',
    'editProfile.phone': 'Telefone',
    'editProfile.phonePlaceholder': '(00) 00000-0000',
    'editProfile.firstNamePlaceholder': 'Seu nome',
    'editProfile.lastNamePlaceholder': 'Seu sobrenome',
    'editProfile.saveChanges': 'Salvar Alterações',
    'editProfile.saving': 'Salvando...',
    'editProfile.changePassword': 'Alterar Senha',
    'editProfile.newPassword': 'Nova Senha',
    'editProfile.confirmPassword': 'Confirmar Nova Senha',
    'editProfile.newPasswordPlaceholder': 'Nova senha',
    'editProfile.confirmPasswordPlaceholder': 'Confirme a nova senha',
    'editProfile.updatePassword': 'Atualizar Senha',
    'editProfile.updating': 'Atualizando...',
    'editProfile.deleteAccount': 'Excluir Conta',
    'editProfile.deleteAccountDesc': 'Ao excluir sua conta, todos os seus dados pessoais, incluindo fotos de progresso e configurações, serão removidos permanentemente. Esta ação não pode ser desfeita.',
    'editProfile.deleteMyAccount': 'Excluir Minha Conta',
    'editProfile.deleting': 'Excluindo...',
    'editProfile.confirmDelete': 'Tem certeza?',
    'editProfile.confirmDeleteDesc': 'Esta ação não pode ser desfeita. Todos os seus dados pessoais e fotos serão excluídos permanentemente.',
    'editProfile.cancel': 'Cancelar',
    'editProfile.confirmDeleteButton': 'Sim, excluir minha conta',
    
    // Languages
    'language.portuguese': 'Português',
    'language.english': 'Inglês',
    'language.select': 'Selecionar idioma',
    
    // Preferences
    'preferences.title': 'Preferências',
    'preferences.language': 'Idioma',
    'preferences.notifications': 'Notificações',
    'preferences.notificationsDesc': 'Receber lembretes de tratamento',
    'preferences.theme': 'Tema',
    'preferences.themeDesc': 'Aparência do aplicativo',
    
    // Security
    'security.title': 'Segurança',
    'security.changePassword': 'Alterar Senha',
    'security.changePasswordDesc': 'Atualize sua senha de acesso',
    'security.twoFactor': 'Autenticação de Dois Fatores',
    'security.twoFactorDesc': 'Adicione uma camada extra de segurança',
    
    // Privacy Policy
    'privacy.title': 'Política de Privacidade',
    'privacy.lastUpdate': 'Última atualização: Abril 2025',
    'privacy.infoCollected': '1. Informações Coletadas',
    'privacy.infoCollectedDesc': 'Coletamos informações pessoais como nome, email, dados de saúde relacionados ao seu tratamento e dados de uso do aplicativo para melhorar sua experiência.',
    'privacy.infoUsage': '2. Uso das Informações',
    'privacy.infoUsageDesc': 'Utilizamos suas informações para fornecer e personalizar nossos serviços, enviar notificações importantes sobre seu tratamento e melhorar nosso aplicativo.',
    'privacy.sharing': '3. Compartilhamento',
    'privacy.sharingDesc': 'Nunca compartilhamos suas informações pessoais com terceiros sem sua autorização explícita, exceto quando exigido por lei.',
    'privacy.security': '4. Segurança',
    'privacy.securityDesc': 'Implementamos medidas de segurança para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.',
    'privacy.rights': '5. Seus Direitos',
    'privacy.rightsDesc': 'Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento através das configurações do aplicativo ou entrando em contato com nosso suporte.',
    'privacy.close': 'Fechar',
    
    // About App
    'about.title': 'Sobre o App',
    'about.version': 'Taqcare | Versão 1.6',
    'about.developedBy': 'Desenvolvido por',
    'about.developer': 'Taqcare Team',
    'about.year': 'Ano',
    'about.yearValue': '2025',
    'about.contact': 'Contato',
    'about.contactEmail': 'suporte@taqcare.com.br',
    'about.description': 'Descrição',
    'about.descriptionText': 'O Ivi Air foi desenvolvido para ajudar pacientes a gerenciar seus tratamentos de forma eficiente, oferecendo recursos de agendamento, acompanhamento de progresso e informações educativas.',
    'about.license': 'Licença',
    'about.licenseText': '© 2025 Taqcare. Todos os direitos reservados.',
    
    // Toast messages
    'toast.logoutSuccess': 'Logout realizado com sucesso',
    'toast.logoutDesc': 'Você foi desconectado da sua conta',
    'toast.logoutError': 'Erro ao fazer logout',
    'toast.logoutErrorDesc': 'Ocorreu um erro ao tentar sair da conta',
    'toast.notificationsOn': 'Notificações ativadas',
    'toast.notificationsOff': 'Notificações desativadas',
    'toast.languageChanged': 'Idioma alterado com sucesso',
    
    // Schedule
    'schedule.title': 'Planejador de Tratamento',
    'schedule.scheduled': 'Agendada',
    'schedule.completed': 'Realizada',
    'schedule.missed': 'Não Realizada',
    'schedule.manage': 'Gerenciar Sessão de Tratamento',
    'schedule.selectedDate': 'Data selecionada:',
    'schedule.selectOption': 'Selecione uma opção:',
    'schedule.scheduleSession': 'Agendar Sessão',
    'schedule.markCompleted': 'Marcar como Realizada',
    'schedule.markMissed': 'Marcar como Não Realizada',
    'schedule.clearStatus': 'Limpar Status',
    'schedule.cancel': 'Cancelar',
    'schedule.sessionScheduled': 'Sessão agendada com sucesso',
    'schedule.sessionCompleted': 'Sessão marcada como realizada',
    'schedule.sessionMissed': 'Sessão marcada como não realizada',
    'schedule.statusRemoved': 'Status removido com sucesso',
    'schedule.addPhoto': 'Adicionar foto',
    
    // Help
    'help.title': 'Precisa de Ajuda?',
    'help.subtitle': 'Estamos aqui para te ajudar',
    'help.startChat': 'Fala com a IA',
    'help.chatDesc': 'Converse conosco sobre suas dúvidas',
    'help.faq': 'Perguntas Frequentes',
    'help.faqDesc': 'Respostas para as dúvidas mais comuns',
    'help.contact': 'Contato',
    'help.contactDesc': 'Entre em contato com nossa equipe',
    'help.inDevelopment': 'Em desenvolvimento',
    'help.inDevelopmentDesc': 'Esta funcionalidade estará disponível em breve!',
    'help.howCanWeHelp': 'Como podemos ajudar?',
    'help.frequentQuestions': 'Dúvidas Frequentes',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Home',
    'nav.education': 'Education',
    'nav.profile': 'Profile',
    'nav.schedule': 'Schedule',
    
    // Dashboard
    'dashboard.hello': 'Hello',
    'dashboard.welcome': 'Welcome',
    'dashboard.trackProgress': 'Track your progress',
    
    // Product descriptions (English versions)
    'product.iplpro.name': 'Ivi Air',
    'product.iplpro.description': 'Home-use laser hair removal device',
    'product.hydry.name': 'Hydry',
    'product.hydry.description': 'Post-IPL moisturizing cream to soothe skin',
    'product.dewy.name': 'Dewy',
    'product.dewy.description': 'Refreshing post-hair removal gel with vitamin E',
    'product.sooth.name': 'Sooth',
    'product.sooth.description': 'Soothing lotion for sensitive skin after treatment',
    'product.gloves.name': 'Premium exfoliating gloves',
    'product.gloves.description': 'For deep skin cleansing',
    
    // Education Hub
    'education.title': 'Ivi Air Tips',
    'education.subtitle': 'Learn how to get the best results from your treatments',
    'education.tutorialTitle': 'Complete Tutorial',
    'education.tutorialDesc': 'Watch the video above to learn how to use your Ivi Air device effectively and safely.',
    'education.stepByStepTitle': 'Step by Step',
    'education.blogsTitle': 'Recommended Blogs for Good Treatment',
    'education.readBlog': 'Read Blog',
    
    // Education Tips
    'education.tip1.title': 'Unpacking and Connecting the Device',
    'education.tip1.description': '📌 The device comes well packaged with: Ivi Air, safety glasses and charger.\n📌 Remove the protective cap from the flash output.\n📌 Connect the cable to the outlet (the device only works when plugged in).\n📌 The Ivi Air will give a signal and turn off. To turn on, press and hold the side button.',
    'education.tip2.title': 'Power Adjustment and Usage Modes',
    'education.tip2.description': '📌 The Ivi Air has adjustable power via the side button. To know the ideal power for your skin, click here.\n📌 For flash activation:\n🔸 Manual mode: press the button to emit pulsed light.\n🔸 Automatic mode: the device detects hair and fires automatically.\n📌 To switch modes, hold the center button.',
    'education.tip3.title': 'Safety and Recommendations',
    'education.tip3.description': '📌 The device is painless, without pain or discomfort.\n📌 Mandatory use of protective glasses to avoid damage from pulsed light.\n📌 Can be applied to most body areas.\n📌 The product includes manual and detailed instructions in the package.',
    
    // Blog Posts
    'blog.post1.title': 'Why IPL hair removal is great for achieving the smooth body of your dreams',
    'blog.post2.title': 'What are the different types of pubic hair?',
    'blog.post3.title': 'IPL laser hair removal at home: does it really work?',
    'blog.post4.title': 'How Often Should You Shave? (A Guide for Legs, Armpits and Pubic Hair)',
    
    // Profile
    'profile.settings': 'Settings',
    'profile.personalize': 'Customize your app experience',
    'profile.edit': 'Edit',
    'profile.user': 'User',
    'profile.loading': 'Loading...',
    'profile.emailLoading': 'Loading email...',
    'profile.logout': 'Logout',
    'profile.endSession': 'End current session',
    'profile.security': 'Security',
    'profile.privacy': 'Privacy Policy',
    'profile.privacyDesc': 'How we protect your data',
    'profile.help': 'Help Center',
    'profile.helpDesc': 'Get support and ask questions',
    'profile.about': 'About App',
    
    // Edit Profile
    'editProfile.title': 'Edit Profile',
    'editProfile.subtitle': 'Update your personal information',
    'editProfile.back': 'Back',
    'editProfile.personalInfo': 'Personal Information',
    'editProfile.firstName': 'First Name',
    'editProfile.lastName': 'Last Name',
    'editProfile.email': 'Email',
    'editProfile.emailReadonly': 'Email cannot be changed.',
    'editProfile.phone': 'Phone',
    'editProfile.phonePlaceholder': '(00) 00000-0000',
    'editProfile.firstNamePlaceholder': 'Your first name',
    'editProfile.lastNamePlaceholder': 'Your last name',
    'editProfile.saveChanges': 'Save Changes',
    'editProfile.saving': 'Saving...',
    'editProfile.changePassword': 'Change Password',
    'editProfile.newPassword': 'New Password',
    'editProfile.confirmPassword': 'Confirm New Password',
    'editProfile.newPasswordPlaceholder': 'New password',
    'editProfile.confirmPasswordPlaceholder': 'Confirm new password',
    'editProfile.updatePassword': 'Update Password',
    'editProfile.updating': 'Updating...',
    'editProfile.deleteAccount': 'Delete Account',
    'editProfile.deleteAccountDesc': 'By deleting your account, all your personal data, including progress photos and settings, will be permanently removed. This action cannot be undone.',
    'editProfile.deleteMyAccount': 'Delete My Account',
    'editProfile.deleting': 'Deleting...',
    'editProfile.confirmDelete': 'Are you sure?',
    'editProfile.confirmDeleteDesc': 'This action cannot be undone. All your personal data and photos will be permanently deleted.',
    'editProfile.cancel': 'Cancel',
    'editProfile.confirmDeleteButton': 'Yes, delete my account',
    
    // Languages
    'language.portuguese': 'Portuguese',
    'language.english': 'English',
    'language.select': 'Select language',
    
    // Preferences
    'preferences.title': 'Preferences',
    'preferences.language': 'Language',
    'preferences.notifications': 'Notifications',
    'preferences.notificationsDesc': 'Receive treatment reminders',
    'preferences.theme': 'Theme',
    'preferences.themeDesc': 'App appearance',
    
    // Security
    'security.title': 'Security',
    'security.changePassword': 'Change Password',
    'security.changePasswordDesc': 'Update your access password',
    'security.twoFactor': 'Two-Factor Authentication',
    'security.twoFactorDesc': 'Add an extra layer of security',
    
    // Privacy Policy
    'privacy.title': 'Privacy Policy',
    'privacy.lastUpdate': 'Last updated: April 2025',
    'privacy.infoCollected': '1. Information Collected',
    'privacy.infoCollectedDesc': 'We collect personal information such as name, email, health data related to your treatment, and app usage data to improve your experience.',
    'privacy.infoUsage': '2. Use of Information',
    'privacy.infoUsageDesc': 'We use your information to provide and personalize our services, send important notifications about your treatment, and improve our application.',
    'privacy.sharing': '3. Sharing',
    'privacy.sharingDesc': 'We never share your personal information with third parties without your explicit authorization, except when required by law.',
    'privacy.security': '4. Security',
    'privacy.securityDesc': 'We implement security measures to protect your information against unauthorized access, alteration, disclosure, or destruction.',
    'privacy.rights': '5. Your Rights',
    'privacy.rightsDesc': 'You have the right to access, correct, or delete your personal data at any time through the app settings or by contacting our support.',
    'privacy.close': 'Close',
    
    // About App
    'about.title': 'About App',
    'about.version': 'Taqcare | Version 1.6',
    'about.developedBy': 'Developed by',
    'about.developer': 'Taqcare Team',
    'about.year': 'Year',
    'about.yearValue': '2025',
    'about.contact': 'Contact',
    'about.contactEmail': 'support@taqcare.com',
    'about.description': 'Description',
    'about.descriptionText': 'Ivi Air was developed to help patients manage their treatments efficiently, offering scheduling features, progress tracking, and educational information.',
    'about.license': 'License',
    'about.licenseText': '© 2025 Taqcare. All rights reserved.',
    
    // Toast messages
    'toast.logoutSuccess': 'Successfully logged out',
    'toast.logoutDesc': 'You have been disconnected from your account',
    'toast.logoutError': 'Error logging out',
    'toast.logoutErrorDesc': 'An error occurred while trying to log out',
    'toast.notificationsOn': 'Notifications enabled',
    'toast.notificationsOff': 'Notifications disabled',
    'toast.languageChanged': 'Language changed successfully',
    
    // Schedule
    'schedule.title': 'Treatment Planner',
    'schedule.scheduled': 'Scheduled',
    'schedule.completed': 'Completed',
    'schedule.missed': 'Missed',
    'schedule.manage': 'Manage Treatment Session',
    'schedule.selectedDate': 'Selected date:',
    'schedule.selectOption': 'Select an option:',
    'schedule.scheduleSession': 'Schedule Session',
    'schedule.markCompleted': 'Mark as Completed',
    'schedule.markMissed': 'Mark as Missed',
    'schedule.clearStatus': 'Clear Status',
    'schedule.cancel': 'Cancel',
    'schedule.sessionScheduled': 'Session scheduled successfully',
    'schedule.sessionCompleted': 'Session marked as completed',
    'schedule.sessionMissed': 'Session marked as missed',
    'schedule.statusRemoved': 'Status removed successfully',
    'schedule.addPhoto': 'Add photo',
    
    // Help
    'help.title': 'Need Help?',
    'help.subtitle': 'We are here to help you',
    'help.startChat': 'Start Chat',
    'help.chatDesc': 'Talk to us about your questions',
    'help.faq': 'FAQ',
    'help.faqDesc': 'Answers to the most common questions',
    'help.contact': 'Contact',
    'help.contactDesc': 'Get in touch with our team',
    'help.inDevelopment': 'In development',
    'help.inDevelopmentDesc': 'This feature will be available soon!',
    'help.howCanWeHelp': 'How can we help?',
    'help.frequentQuestions': 'Frequent Questions',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('LanguageProvider: Initializing...');
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && (savedLanguage === 'pt' || savedLanguage === 'en')) {
      console.log('LanguageProvider: Found saved language:', savedLanguage);
      setLanguage(savedLanguage);
    }
    setIsInitialized(true);
    console.log('LanguageProvider: Initialization complete');
  }, []);

  const changeLanguage = (lang: Language) => {
    console.log('LanguageProvider: Changing language to:', lang);
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    const translation = translations[language][key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key} in language: ${language}`);
      return key;
    }
    return translation;
  };

  // Don't render children until context is initialized
  if (!isInitialized) {
    console.log('LanguageProvider: Not initialized yet, showing loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  console.log('LanguageProvider: Rendering with language:', language);
  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  console.log('useLanguage: Context value:', context);
  if (context === undefined) {
    console.error('useLanguage must be used within a LanguageProvider');
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
