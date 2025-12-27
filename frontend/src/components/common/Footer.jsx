export default function Footer() {
  return (
    <footer className="bg-gray-600 text-white border-t mt-12 mb-0">
      <div className="max-w-6xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-3">
        <div>
          <h4 className="text-xl font-bold text-white">EduPlatform</h4>
          <p className="text-sm text-white mt-2">High-quality courses from industry experts to help you grow your career.</p> 
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-4 md:grid-cols-2">
          <div>
            <h5 className="text-sm font-semibold text-white">Company</h5>
            <ul className="mt-2 space-y-2 text-sm text-white">
              <li><a href="/about" className="text-white hover:text-indigo-200">About</a></li>
              <li><a href="/careers" className="text-white hover:text-indigo-200">Careers</a></li>
              <li><a href="/contact" className="text-white hover:text-indigo-200">Contact</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-white">Support</h5>
            <ul className="mt-2 space-y-2 text-sm text-white">
              <li><a href="/help" className="text-white hover:text-indigo-200">Help Center</a></li>
              <li><a href="/terms" className="text-white hover:text-indigo-200">Terms</a></li>
              <li><a href="/privacy" className="text-white hover:text-indigo-200">Privacy</a></li>
            </ul>
          </div>
        </nav>

        <div className="md:text-right">
          <h5 className="text-sm font-semibold text-white">Stay connected</h5>
          <div className="mt-2 flex items-center justify-start md:justify-end gap-3">
            <a href="#" className="text-white hover:text-indigo-200" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M8 19c7 0 10.8-5.8 10.8-10.8v-.5A7.7 7.7 0 0 0 20 6.3a7.4 7.4 0 0 1-2.1.6 3.7 3.7 0 0 0 1.6-2 7.4 7.4 0 0 1-2.4.9 3.7 3.7 0 0 0-6.3 3.4A10.5 10.5 0 0 1 4 5.7a3.7 3.7 0 0 0 1.1 4.9A3.6 3.6 0 0 1 3 10v.1a3.7 3.7 0 0 0 3 3.6 3.7 3.7 0 0 1-1 .1 3.5 3.5 0 0 1-.7-.1 3.7 3.7 0 0 0 3.4 2.6A7.5 7.5 0 0 1 4 17.6 10.5 10.5 0 0 0 11 19" />
              </svg>
            </a>

            <a href="#" className="text-white hover:text-indigo-200" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 24V7.98h4.98V24H0zM7.5 7.98H12v2.18h.07c.63-1.2 2.17-2.47 4.47-2.47C21.2 7.69 24 9.84 24 14.2V24h-4.98v-8.1c0-1.93-.03-4.4-2.68-4.4-2.68 0-3.09 2.09-3.09 4.25V24H7.5V7.98z" />
              </svg>
            </a>

            <a href="#" className="text-white hover:text-indigo-200" aria-label="GitHub">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.41-1.34-1.78-1.34-1.78-1.09-.75.08-.73.08-.73 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.46-2.38 1.22-3.22-.12-.3-.53-1.52.12-3.17 0 0 .99-.32 3.25 1.22a11.3 11.3 0 0 1 5.93 0c2.26-1.54 3.25-1.22 3.25-1.22.65 1.65.24 2.87.12 3.17.76.84 1.22 1.91 1.22 3.22 0 4.61-2.8 5.62-5.47 5.92.43.36.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .5z" />
              </svg>
            </a> 
          </div>
        </div>
      </div>

      <div className="border-t border-gray-600 bg-gray-600">
        <div className="max-w-6xl mx-auto px-4 py-3 text-sm text-white flex flex-col md:flex-row justify-between items-center">
          <span className="w-screen mt-2 md:mt-0 text-center">Built with ❤️</span>
        </div>
      </div>
    </footer>
  );
}
