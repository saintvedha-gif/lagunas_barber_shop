import Footer from "@/components/layout/Footer"
import Navbar from "@/components/layout/Navbar"
import Providers from "@/components/Providers"
import type { Metadata } from "next"
import { Bebas_Neue, Roboto } from "next/font/google"
import "./globals.css"

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
})

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Laguna's Barber & Shop",
  description:
    "Barbería y tienda de ropa y cosméticos capilares en Cali. Cortes profesionales, ropa urbana y productos de calidad.",
  keywords: ["barbería", "ropa", "cosméticos", "Cali", "Laguna's"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${bebasNeue.variable} ${roboto.variable}`}>
      <body className="antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
