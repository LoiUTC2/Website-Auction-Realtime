import { useContext, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Gavel, Shield, Book, HeartHandshake, Users, History, Trophy, HelpCircle } from 'lucide-react'
import { Helmet } from 'react-helmet'
import { AppContext } from '../../AppContext'
import { AboutLanguage } from '../../languages/AboutLanguage'

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('about')
  const { language } = useContext(AppContext)
  const languageText = useMemo(() => AboutLanguage[language], [language])
  const tabs = [
    { id: 'about', icon: Users, title: languageText.aboutUs },
    { id: 'rules', icon: Book, title: languageText.rules },
    { id: 'process', icon: Gavel, title: languageText.auctionProcess },
    { id: 'legal', icon: Shield, title: languageText.legalTerms },
    { id: 'values', icon: HeartHandshake, title: languageText.ourValues },
    { id: 'history', icon: History, title: languageText.ourHistory },
    { id: 'achievements', icon: Trophy, title: languageText.achievements },
    { id: 'faq', icon: HelpCircle, title: languageText.faq },
  ]

  const content = {
    about: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{languageText.welcomeText}</h3>
        <p>{languageText.aboutDescription}</p>
        <p>{languageText.missionStatement}</p>
        <h4 className="text-lg font-semibold mt-4">{languageText.whatSetsUsApart}</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>{languageText.categoryRange}</li>
          <li>{languageText.verifiedSellers}</li>
          <li>{languageText.secureTransactions}</li>
          <li>{languageText.expertSupport}</li>
          <li>{languageText.globalReach}</li>
        </ul>
      </div>
    ),
    rules: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{languageText.rulesTitle}</h3>
        <p>{languageText.rulesDescription}</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>{languageText.accurateRegistration}</li>
          <li>{languageText.maintainConfidentiality}</li>
          <li>{languageText.complyWithRegulations}</li>
          <li>{languageText.noFraudulentMethods}</li>
          <li>{languageText.respectIntellectualProperty}</li>
          <li>{languageText.respectfulCommunication}</li>
          <li>{languageText.reportSuspiciousActivity}</li>
          <li>{languageText.promptPayment}</li>
          <li>{languageText.accurateItemDescription}</li>
          <li>{languageText.abideByReturnPolicies}</li>
        </ul>
        <p>{languageText.consequencesOfViolation}</p>
      </div>
    ),
    process: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{languageText.auctionProcessTitle}</h3>
        <p>{languageText.auctionProcessDescription}</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>{languageText.browseListings}</li>
          <li>{languageText.registerForAuction}</li>
          <li>{languageText.placeDeposit}</li>
          <li>{languageText.bidding}</li>
          <li>{languageText.automaticBidding}</li>
          <li>{languageText.liveAuctions}</li>
          <li>{languageText.winningBid}</li>
          <li>{languageText.payment}</li>
          <li>{languageText.shipping}</li>
          <li>{languageText.feedback}</li>
        </ol>
        <p>{languageText.auctionGuideLink}</p>
      </div>
    ),
    legal: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{languageText.legalTermsTitle}</h3>
        <p>{languageText.legalTermsDescription}</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>{languageText.userPrivacyProtection}</li>
          <li>{languageText.transparentAuctions}</li>
          <li>{languageText.disputeResolution}</li>
          <li>{languageText.financialCompliance}</li>
          <li>{languageText.intellectualPropertyRights}</li>
          <li>{languageText.termsOfService}</li>
          <li>{languageText.ageRestrictions}</li>
          <li>{languageText.antiFraudMeasures}</li>
        </ul>
        <p>{languageText.legalDocsLink}</p>
      </div>
    ),
    values: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{languageText.ourValuesTitle}</h3>
        <p>{languageText.valuesDescription}</p>
        <ul className="space-y-4">
          <li>
            <strong className="text-lg">{languageText.integrity}</strong>
            <p>{languageText.integrityDescription}</p>
          </li>
          <li>
            <strong className="text-lg">{languageText.innovation}</strong>
            <p>{languageText.innovationDescription}</p>
          </li>
          <li>
            <strong className="text-lg">{languageText.community}</strong>
            <p>{languageText.communityDescription}</p>
          </li>
          <li>
            <strong className="text-lg">{languageText.excellence}</strong>
            <p>{languageText.excellenceDescription}</p>
          </li>
          <li>
            <strong className="text-lg">{languageText.transparency}</strong>
            <p>{languageText.transparencyDescription}</p>
          </li>
        </ul>
      </div>
    ),
    history: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{languageText.historyTitle}</h3>
        <p>{languageText.historyDescription}</p>
        <ul className="space-y-2">
          <li><strong>2010:</strong> {languageText.history2010}</li>
          <li><strong>2012:</strong> {languageText.history2012}</li>
          <li><strong>2014:</strong> {languageText.history2014}</li>
          <li><strong>2016:</strong> {languageText.history2016}</li>
          <li><strong>2018:</strong> {languageText.history2018}</li>
          <li><strong>2020:</strong> {languageText.history2020}</li>
          <li><strong>2022:</strong> {languageText.history2022}</li>
          <li><strong>2024:</strong> {languageText.history2024}</li>
        </ul>
        <p>{languageText.historyEnd}</p>
      </div>
    ),
    achievements: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{languageText.achievementsTitle}</h3>
        <p>{languageText.achievementsDescription}</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>{languageText.achievement1}</li>
          <li>{languageText.achievement2}</li>
          <li>{languageText.achievement3}</li>
          <li>{languageText.achievement4}</li>
          <li>{languageText.achievement5}</li>
          <li>{languageText.achievement6}</li>
          <li>{languageText.achievement7}</li>
        </ul>
        <p>{languageText.achievementsMotivation}</p>
      </div>
    ),
    faq: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{languageText.faqTitle}</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">{languageText.faqHowToStart}</h4>
            <p>{languageText.faqHowToStartAnswer}</p>
          </div>
          <div>
            <h4 className="font-semibold">{languageText.faqFees}</h4>
            <p>{languageText.faqFeesAnswer}</p>
          </div>
          <div>
            <h4 className="font-semibold">{languageText.faqAuthenticity}</h4>
            <p>{languageText.faqAuthenticityAnswer}</p>
          </div>
          <div>
            <h4 className="font-semibold">{languageText.faqPaymentMethods}</h4>
            <p>{languageText.faqPaymentMethodsAnswer}</p>
          </div>
          <div>
            <h4 className="font-semibold">{languageText.faqShipping}</h4>
            <p>{languageText.faqShippingAnswer}</p>
          </div>
        </div>
        <p>{languageText.faqLink}</p>
      </div>
    ),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>{languageText.pageTitle}</title>
        <meta name="description" content={languageText.pageDescription} />
        <meta property="og:title" content={languageText.pageTitle} />
        <meta property="og:description" content={languageText.pageDescription} />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            {languageText.pageHeading}
          </h1>
          <p className="mt-5 text-xl text-gray-500">
            {languageText.pageSubheading}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white shadow-xl rounded-lg overflow-hidden"
        >
          <div className="flex flex-wrap border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-1 text-center text-sm font-medium ${activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-500'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <tab.icon className="mx-auto h-6 w-6 mb-1" />
                {tab.title}
              </button>
            ))}
          </div>
          <div className="p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {content[activeTab]}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{languageText.needHelp}</h2>
          <p className="text-gray-600">
            {languageText.contactInfo}{' '}
            <a href="mailto:support@auctionhouse.com" className="text-indigo-600 hover:text-indigo-500">
              support@auctionhouse.com
            </a>{' '}
            {languageText.hotline}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
