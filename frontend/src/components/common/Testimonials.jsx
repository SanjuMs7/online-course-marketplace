export default function Testimonials() {
  return (
    <section className="max-w-6xl mx-auto px-4 mt-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">What students say</h3>
        <p className="text-sm text-gray-500">Real reviews from learners</p>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <figure className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
          <svg aria-hidden className="w-6 h-6 text-indigo-600 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 21H5a2 2 0 0 1-2-2v-4a6 6 0 0 1 6-6h0" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 21h-4a2 2 0 0 1-2-2v-4a6 6 0 0 1 6-6h0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <blockquote className="text-gray-700 italic mb-4">"This platform helped me change careers — the instructors are top-notch."</blockquote>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.45a1 1 0 0 0-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.45a1 1 0 0 0-1.175 0l-3.37 2.45c-.785.57-1.84-.197-1.54-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69L9.049 2.927z" />
                </svg>
              ))}
            </div>

            <figcaption className="text-sm text-gray-600">— Priya, Product Manager</figcaption>
          </div>
        </figure>

        <figure className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
          <svg aria-hidden className="w-6 h-6 text-indigo-600 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 21H5a2 2 0 0 1-2-2v-4a6 6 0 0 1 6-6h0" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 21h-4a2 2 0 0 1-2-2v-4a6 6 0 0 1 6-6h0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <blockquote className="text-gray-700 italic mb-4">"Hands-on projects and great community support — highly recommend."</blockquote>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.45a1 1 0 0 0-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.45a1 1 0 0 0-1.175 0l-3.37 2.45c-.785.57-1.84-.197-1.54-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69L9.049 2.927z" />
                </svg>
              ))}
            </div>

            <figcaption className="text-sm text-gray-600">— Rohit, Freelancer</figcaption>
          </div>
        </figure>

        <figure className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
          <svg aria-hidden className="w-6 h-6 text-indigo-600 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 21H5a2 2 0 0 1-2-2v-4a6 6 0 0 1 6-6h0" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 21h-4a2 2 0 0 1-2-2v-4a6 6 0 0 1 6-6h0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <blockquote className="text-gray-700 italic mb-4">"Great value and practical content. I landed my dream job!"</blockquote>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.45a1 1 0 0 0-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.45a1 1 0 0 0-1.175 0l-3.37 2.45c-.785.57-1.84-.197-1.54-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69L9.049 2.927z" />
                </svg>
              ))}
            </div>

            <figcaption className="text-sm text-gray-600">— Anjali, Software Engineer</figcaption>
          </div>
        </figure>
      </div>
    </section>
  );
}
