import { i18n } from '@/i18n/riskAssessment/index.js'
const $t = text => i18n.t(text)
export const riskData = {
    openDerivative: {
        text: $t('derivativesKnowledge'),
        1: $t('have'),
        2: $t('notHave'),
    },
    riskLevel: {
        text: $t('riskLevel'),
        1: { type: $t('riskLevel1'), score: '7-14', description: $t('riskDescription1'), min: 7, max: 14 },
        2: { type: $t('riskLevel2'), score: '15-29', description: $t('riskDescription2'), min: 15, max: 29 },
        3: { type: $t('riskLevel3'), score: '30-44', description: $t('riskDescription3'), min: 30, max: 44 },
        4: { type: $t('riskLevel4'), score: '45-58', description: $t('riskDescription4'), min: 45, max: 58 },
        5: { type: $t('riskLevel5'), score: '59-71', description: $t('riskDescription5'), min: 59, max: 71 },
    },
    investmentObjective: {
        text: $t('investmentObjectives'),
        1: $t('investmentObjectives1'),
        2: $t('investmentObjectives2'),
        3: $t('investmentObjectives3'),
        4: $t('investmentObjectives4'),
        5: $t('investmentObjectives5'),
    },
    investmentExperience: {
        text: $t('investmentYears'),
        1: $t('investmentYears1'),
        2: $t('investmentYears2'),
        3: $t('investmentYears3'),
        4: $t('investmentYears4'),
        5: $t('investmentYears5'),
    },
}
