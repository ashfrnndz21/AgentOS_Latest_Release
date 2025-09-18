import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Inter', 'system-ui', 'sans-serif'],
				'mono': ['JetBrains Mono', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// AWS AgentOSDemo brand colors - professional dark theme
				true: {
					red: '#DC2626',
					'red-dark': '#991B1B',
					'red-light': '#EF4444',
					white: '#FFFFFF',
					dark: '#0F172A',
					'dark-accent': '#1E293B',
					text: '#F8FAFC',
					slate: '#64748B',
					'slate-light': '#94A3B8',
					'slate-dark': '#475569'
				},
				// Professional beam colors
				beam: {
					blue: '#3B82F6',
					'blue-dark': '#1E40AF',
					'blue-light': '#60A5FA',
					'gradient-start': '#0F172A',
					'gradient-end': '#1E293B',
					dark: '#0F172A',
					'dark-accent': '#1E293B',
					text: '#F8FAFC',
					slate: '#64748B',
					'slate-light': '#94A3B8'
				},
				// Update PTT colors to True colors
				'ptt': {
					blue: '#E31E24',
					'blue-light': '#EF5350',
					red: '#E31E24',
					dark: '#1A1A1A',
					'gray-dark': '#333333',
					'gray-medium': '#8A898C',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' }
				},
				'fade-in': {
					'0%': { 
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': { 
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'shimmer': {
					'0%': { backgroundPosition: '100% 0' },
					'100%': { backgroundPosition: '-100% 0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
				'fade-in': 'fade-in 0.3s ease-out',
				'shimmer': 'shimmer 2s infinite'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
			},
			boxShadow: {
				'glow-blue': '0 0 20px rgba(59, 130, 246, 0.15)',
				'glow-purple': '0 0 20px rgba(147, 51, 234, 0.15)',
				'glow-green': '0 0 20px rgba(34, 197, 94, 0.15)',
				'inner-glow': 'inset 0 0 15px rgba(59, 130, 246, 0.1)',
				'message': '0 2px 8px rgba(0, 0, 0, 0.2)',
				'button-glow': '0 0 10px rgba(59, 130, 246, 0.3)',
				'professional': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'premium': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
