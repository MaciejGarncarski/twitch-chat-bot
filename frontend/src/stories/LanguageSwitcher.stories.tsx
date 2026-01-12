import type { Meta, StoryObj } from "@storybook/react-vite"

import { I18nProvider } from "@/features/i18n/components/i18n-provider"
import { LanguageSwitcher } from "@/features/i18n/components/language-switcher"

const meta = {
  title: "Components/LanguageSwitcher",
  component: LanguageSwitcher,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <I18nProvider defaultLanguage="en">
        <Story />
      </I18nProvider>
    ),
  ],
} satisfies Meta<typeof LanguageSwitcher>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
