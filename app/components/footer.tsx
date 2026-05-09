"use client";

import Facebook from "../constants/Facebook";
import Instagram from "../constants/Instagram";
import Linkedin from "../constants/Linkedin";
import Twitter from "../constants/Twitter";


export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          <div className="col-span-2 lg:col-span-2">
            <div className="text-2xl font-bold tracking-tighter mb-6">LUMINA</div>
            <p className="text-slate-500 max-w-xs text-sm leading-relaxed">
              An independent publication dedicated to the intersection of technology and human experience.
              Designed for the modern intellectual.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-wider">Publication</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-900 transition-colors">The Magazine</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Podcast</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Events</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Archives</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-wider">Company</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-900 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Privacy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-wider">Social</h4>
            <div className="flex gap-2 flex-col items-start justify-center">
              <a href="#" className="text-slate-900 hover:text-slate-900 transition-colors size-7">
                <Facebook />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors size-7">
                <Instagram />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors size-7">
                <Linkedin />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors size-7">
                <Twitter />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© 2026 Lumina Media. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
