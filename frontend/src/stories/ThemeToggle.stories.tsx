import type { Meta, StoryObj } from "@storybook/react-vite"

import { ThemeProvider } from "@/components/theme-provider"
import { I18nProvider } from "@/features/i18n/components/i18n-provider"
import { ThemeToggle } from "@/components/theme-toggle"

const meta = {
  title: "Components/ThemeToggle",
  component: ThemeToggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <I18nProvider defaultLanguage="en">
        <ThemeProvider defaultTheme="light">
          <Story />
        </ThemeProvider>
      </I18nProvider>
    ),
  ],
} satisfies Meta<typeof ThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const WithText: Story = {
  args: {
    withText: true,
  },
}

export const WithoutText: Story = {
  args: {
    withText: false,
  },
}
