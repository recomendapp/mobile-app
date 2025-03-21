import { ThemedSafeAreaView } from '@/components/ui/ThemedSafeAreaView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTranslation } from 'react-i18next';


const AboutScreen = () => {
	const { t } = useTranslation();

	const resources = [
		{
			name: 'Eyecandy',
			link: 'https://eycndy.co',
		},
		{
			name: 'Are.na',
			link: 'https://www.are.na',
		},
		{
			name: 'Savee',
			link: 'https://savee.it',
		},
		{
			name: 'Flimgrab',
			link: 'https://film-grab.com/',
		},
		{
			name: 'Flim',
			link: 'https://flim.ai/',
		},
		{
			name: 'Directors Library',
			link: 'https://directorslibrary.com/',
		},
		{
			name: 'Shotdeck',
			link: 'https://shotdeck.com/',
		},
		{
			name: 'Kive',
			link: 'https://www.kive.ai',
		},
		{
			name: 'Mymind',
			link: 'https://mymind.com/',
		},
		{
			name: 'My 2000s TV',
			link: 'https://www.my00stv.com/',
		},
		{
			name: 'Art of the title',
			link: 'https://www.artofthetitle.com/',
		},
		{
			name: 'Short of the Week',
			link: 'https://www.shortoftheweek.com',
		},
		{
			name: 'Frame Set',
			link: 'https://frameset.app',
		},
		{
			name: 'Infomaniak',
			link: 'https://www.infomaniak.com',
		},
		{
			name: 'Pousse ta fonte',
			link: 'https://www.poussetafonte.com/',
		},
		{
			name: 'FontBrief',
			link: 'https://www.fontbrief.com',
		},
	];

  return (
    <ThemedSafeAreaView className="flex-1">
		  <ThemedText>made by @loup</ThemedText>
    </ThemedSafeAreaView>
  );
};
    //   {/* ABOUT */}
    //   <section id="about" className="w-full flex flex-col items-center gap-2">
    //     {/* <Marquee pauseOnHover className=' bg-blue-500 py-1 uppercase z-0'>
    //         {Array.from({ length: 3 }).map((_, index) => (
    //           <p key={index} className='mr-8 font-bold'>
    //             {t('about.marquee')}
    //           </p>
    //         ))}
    //       </Marquee> */}
    //     <div className="px-4 flex flex-col gap-4 max-w-xl">
    //       <h2 className="text-center font-semibold text-3xl text-accent-1">
    //         {t('about.label')}
    //       </h2>
    //       <p>
    //         {t.rich('about.intro', {
    //           strong: (chunks) => <strong>{chunks}</strong>,
    //         })}
    //       </p>
    //       <ul className="text-center space-y-2">
    //         <li>{t('about.slogan.1')}</li>
    //         <li>{t('about.slogan.2')}</li>
    //         <li>{t('about.slogan.3')}</li>
    //         <li>{t('about.slogan.4')}</li>
    //       </ul>
    //       <p>{t('about.last')}</p>
    //     </div>
    //   </section>
    //   {/* TEAM */}
    //   <section id="team" className="w-full flex flex-col gap-4 px-4 max-w-xl">
    //     <h2 className="text-center font-semibold text-3xl text-accent-1">
    //       {t('team.label')}
    //     </h2>
    //     <p>{t('team.intro')}</p>
    //     {/* MEMBERS */}
    //     <div className="w-full space-y-4">
    //       {/* YOANN */}
    //       <div className="bg-muted rounded-md p-4 w-full">
    //         <h3 className=" text-lg font-semibold">
    //           {t('team.members.yoann.name')}
    //         </h3>
    //         <p>{t('team.members.yoann.description')}</p>
    //       </div>
    //       {/* LOUP */}
    //       <div className="bg-muted rounded-md p-4 w-full">
    //         <h3 className=" text-lg font-semibold">
    //           {t('team.members.loup.name')}
    //         </h3>
    //         <p>{t('team.members.loup.description')}</p>
    //       </div>
    //     </div>
    //     <p>
    //       {t.rich('team.last', {
    //         link: (chunks) => (
    //           <Link
    //             href="https://discord.gg/z4fXr39xPr"
    //             target="_blank"
    //             className="underline underline-offset-2 hover:text-accent-pink"
    //           >
    //             {chunks}
    //           </Link>
    //         ),
    //       })}
    //     </p>
    //   </section>
    //   {/* PRICING */}
    //   <section
    //     id="pricing"
    //     className="w-full flex flex-col gap-4 px-4 max-w-xl"
    //   >
    //     <h2 className="text-center font-semibold text-3xl text-accent-1">
    //       {t('pricing.label')}
    //     </h2>
    //     <p>{t('pricing.intro')}</p>
    //     <Pricing
    //       session={session}
    //       products={products}
    //       title={false}
    //       className="!p-0"
    //     />
    //     <p className="text-xs italic text-muted-foreground">
    //       {t('pricing.subdescription')}
    //     </p>
    //   </section>
    //   {/* BUSINESS MODEL */}
    //   <section
    //     id="businessmodel"
    //     className="w-full flex flex-col gap-4 px-4 max-w-xl"
    //   >
    //     <h2 className="text-center font-semibold text-3xl text-accent-1">
    //       {t('businessmodel.label')}
    //     </h2>
    //     <p>{t('businessmodel.paragraph.1')}</p>
    //     <p>{t('businessmodel.paragraph.2')}</p>
    //     <p>{t('businessmodel.paragraph.3')}</p>
    //   </section>
    //   {/* ROADMAP */}
    //   <section
    //     id="roadmap"
    //     className="w-full flex flex-col gap-4 px-4 max-w-xl"
    //   >
    //     <h2 className="text-center font-semibold text-3xl text-accent-1">
    //       {t('roadmap.label')}
    //     </h2>
    //     <div className="bg-muted p-4 rounded-md text-muted-foreground text-center">
    //       Coming soon...
    //     </div>
    //   </section>
    //   {/* DATA */}
    //   <section id="data" className="w-full flex flex-col gap-4 px-4 max-w-xl">
    //     <h2 className="text-center font-semibold text-3xl text-accent-1">
    //       {t('data.label')}
    //     </h2>
    //     <p>
    //       {t.rich('data.paragraph.1', {
    //         link: (chunks) => (
    //           <Link
    //             href="https://www.themoviedb.org/"
    //             target="_blank"
    //             className="underline underline-offset-2 hover:text-accent-pink"
    //           >
    //             {chunks}
    //           </Link>
    //         ),
    //       })}
    //     </p>
    //     <p>
    //       {t.rich('data.paragraph.2', {
    //         link: (chunks) => (
    //           <Link
    //             href="https://www.themoviedb.org/"
    //             target="_blank"
    //             className="underline underline-offset-2 hover:text-accent-pink"
    //           >
    //             {chunks}
    //           </Link>
    //         ),
    //       })}
    //     </p>
    //   </section>
    //   {/* RESOURCES */}
    //   <section
    //     id="resources"
    //     className="w-full flex flex-col gap-4 px-4 max-w-xl"
    //   >
    //     <h2 className="text-center font-semibold text-3xl text-accent-1">
    //       {t('resources.label')}
    //     </h2>
    //     <p>{t('resources.intro')}</p>
    //     <ul className="space-y-2 list-disc">
    //       {resources.map((resource, index) => (
    //         <li key={index}>
    //           <Link
    //             href={resource.link}
    //             target="_blank"
    //             className="underline underline-offset-2 hover:text-accent-pink"
    //           >
    //             {resource.name}
    //           </Link>
    //         </li>
    //       ))}
    //     </ul>
    //   </section>
    //   {/* CONTACT & SUPPORT */}
    //   <section
    //     id="contact-support"
    //     className="w-full flex flex-col gap-4 px-4 max-w-xl"
    //   >
    //     <h2 className="text-center font-semibold text-3xl text-accent-1">
    //       {t('contact-support.label')}
    //     </h2>
    //     <p>
    //       {t.rich('contact-support.help-center', {
    //         link: (chunks) => (
    //           <Link
    //             href="https://help.recomend.app/"
    //             target="_blank"
    //             className="underline underline-offset-2 hover:text-accent-pink"
    //           >
    //             {chunks}
    //           </Link>
    //         ),
    //       })}
    //     </p>
    //     <p>
    //       {t.rich('contact-support.technical-support', {
    //         link: (chunks) => (
    //           <Link
    //             href="mailto:help@recomend.app"
    //             className="underline underline-offset-2 hover:text-accent-pink"
    //           >
    //             {chunks}
    //           </Link>
    //         ),
    //       })}
    //     </p>
    //     <p>
    //       {t.rich('contact-support.suggest-a-feature', {
    //         link: (chunks) => (
    //           <Link
    //             href="mailto:ideas@recomend.app"
    //             className="underline underline-offset-2 hover:text-accent-pink"
    //           >
    //             {chunks}
    //           </Link>
    //         ),
    //       })}
    //     </p>
    //     <p>
    //       {t.rich('contact-support.contact-us', {
    //         link: (chunks) => (
    //           <Link
    //             href="mailto:contact@recomend.app"
    //             className="underline underline-offset-2 hover:text-accent-pink"
    //           >
    //             {chunks}
    //           </Link>
    //         ),
    //       })}
    //     </p>
    //   </section>
    //   {/* QUOTE */}
    //   <section
    //     id="quote"
    //     className="w-full flex flex-col gap-4 px-4 max-w-xl mt-5 py-8"
    //   >
    //     <blockquote className="relative">
    //       <svg
    //         className="absolute -top-6 -start-5 h-12 w-12 text-muted"
    //         width="16"
    //         height="16"
    //         viewBox="0 0 16 16"
    //         fill="none"
    //         xmlns="http://www.w3.org/2000/svg"
    //         aria-hidden="true"
    //       >
    //         <path
    //           d="M7.39762 10.3C7.39762 11.0733 7.14888 11.7 6.6514 12.18C6.15392 12.6333 5.52552 12.86 4.76621 12.86C3.84979 12.86 3.09047 12.5533 2.48825 11.94C1.91222 11.3266 1.62421 10.4467 1.62421 9.29999C1.62421 8.07332 1.96459 6.87332 2.64535 5.69999C3.35231 4.49999 4.33418 3.55332 5.59098 2.85999L6.4943 4.25999C5.81354 4.73999 5.26369 5.27332 4.84476 5.85999C4.45201 6.44666 4.19017 7.12666 4.05926 7.89999C4.29491 7.79332 4.56983 7.73999 4.88403 7.73999C5.61716 7.73999 6.21938 7.97999 6.69067 8.45999C7.16197 8.93999 7.39762 9.55333 7.39762 10.3ZM14.6242 10.3C14.6242 11.0733 14.3755 11.7 13.878 12.18C13.3805 12.6333 12.7521 12.86 11.9928 12.86C11.0764 12.86 10.3171 12.5533 9.71484 11.94C9.13881 11.3266 8.85079 10.4467 8.85079 9.29999C8.85079 8.07332 9.19117 6.87332 9.87194 5.69999C10.5789 4.49999 11.5608 3.55332 12.8176 2.85999L13.7209 4.25999C13.0401 4.73999 12.4903 5.27332 12.0713 5.85999C11.6786 6.44666 11.4168 7.12666 11.2858 7.89999C11.5215 7.79332 11.7964 7.73999 12.1106 7.73999C12.8437 7.73999 13.446 7.97999 13.9173 8.45999C14.3886 8.93999 14.6242 9.55333 14.6242 10.3Z"
    //           fill="currentColor"
    //         />
    //       </svg>

    //       <div className="relative">
    //         <p className="text-center">
    //           <em>{t('quote.quote')}</em>
    //         </p>
    //         <p className="sm:text-sm text-right text-accent-1">
    //           {t('quote.author')}, {t('quote.date')}
    //         </p>
    //       </div>
    //     </blockquote>
    //     <p className="text-xs italic text-muted-foreground">
    //       {t('quote.subdescription')}
    //     </p>
    //   </section>

export default AboutScreen;