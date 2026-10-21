"""Build every page of the Reports & Analytics showcase.

    python tools/build.py

Writes static HTML next to assets/. Re-run after changing any page module.
"""
import lib, pages_dash, pages_reports, pages_misc

if __name__ == '__main__':
    pages_dash.build()
    pages_reports.build()
    pages_misc.build()
    n, missing = lib.write_all()
    print(f'built {n} pages')
    if missing:
        print('MISSING ICONS:', ', '.join(missing))
