from run_server import launch_web_server

from jinja2 import FileSystemLoader
from jinja2 import Environment as Jinja2Environment
import sass
from webassets import Environment as AssetsEnvironment
from webassets import Bundle
from webassets.ext.jinja2 import AssetsExtension
from webassets.filter import Filter, register_filter

import shutil
import os
import sys
import http
import re
import pathlib
import getopt


class NoopFilter(Filter):
    name = 'noop'

    def output(self, _in, out, **kwargs):
        out.write(_in.read())

    def input(self, _in, out, **kwargs):
        out.write(_in.read())

register_filter(NoopFilter)

# Need to remove the already compiled assets here...

def compile_pages_and_assets(dev=False, gh_pages=False):

    if(gh_pages):
        output_dir = 'docs'
    else:
        output_dir = 'output'

    make_sure_all_folders_exists(output_dir)

    compiledSass = ''
    sass_files_to_compile = ['main.scss']
    for sassFile in sass_files_to_compile:
        # with open('resources/css/scss/'+sassFile, 'r') as thisfile:
        #     SassData=thisfile.read()
        compiledSass += sass.compile(filename='resources/css/scss/'+sassFile, include_paths='resources/css/scss/vendor/')
    with open('resources/css/sass.css', 'w') as outputFile:
        outputFile.write(compiledSass)

    if(dev):
        all_js = Bundle('**/*.js', filters='noop', output='packed.js')
        all_css = Bundle('**/*.css', filters='noop', output="main.css")
    else:
        all_js = Bundle('**/*.js', filters='jsmin', output='packed.js')
        all_css = Bundle('**/*.css', filters='cssmin', output="main.css")

    jinja_env = Jinja2Environment(extensions=[AssetsExtension])
    jinja_env.loader = FileSystemLoader('.')
    assets_env = AssetsEnvironment(url='/assets', directory='resources')

    assets_env.register('all_js', all_js)
    assets_env.register('all_css', all_css)

    jinja_env.assets_environment = assets_env

    pages = []
    pages_dir = 'pages'
    for path, subdirs, files in os.walk(pages_dir):
        for name in files:
            pages.append(os.path.join(path, name)[6:])
    # print(pages)

    for page in pages:
        thisTemplate = jinja_env.get_template('pages/' + page)
        thisTempRendered = thisTemplate.render()
        file_name = output_dir + '/' + page
        body_content_location = output_dir + '/content/' + page
        header_content_location = output_dir + '/content/head/' + page
        pathlib.Path(os.path.dirname(file_name)).mkdir(parents=True, exist_ok=True)
        pathlib.Path(os.path.dirname(body_content_location)).mkdir(parents=True, exist_ok=True)
        with open(file_name, 'w') as tempFile:
            tempFile.write(thisTempRendered)

        # This bit is used for my ajax shenanigans
        # anything you want on a page needs to go on body though...
        result = re.search('<body>(.*)<\/body>', '"' + thisTempRendered.replace('"', '\"').replace('\n',' ') + '"')
        # print(result)
        onlyTheBodyPart = result.group(1)
        with open(body_content_location, 'w') as tempFile:
            tempFile.write(onlyTheBodyPart)

        result = re.search('<!-- Start Additional Header Part --> (.*) </head>', '"' + thisTempRendered.replace('"', '\"').replace('\n',' ') + '"')
        onlyTheExtraHeader = result.group(1)
        with open(header_content_location, 'w') as tempFile:
            tempFile.write(onlyTheExtraHeader)


    src = 'resources'
    dst = output_dir + '/assets'
    filelist = []
    files = ['main.css', 'packed.js']
    for filename in files:
      filelist.append(filename)
      fullpath = src + '/' + filename
      shutil.move(os.path.join(src, filename), os.path.join(dst, filename))

def make_sure_all_folders_exists(base_dir):
    make_sure_folder_exists(base_dir)
    make_sure_folder_exists(base_dir+'/assets/')
    make_sure_folder_exists(base_dir+'/content/')
    make_sure_folder_exists(base_dir+'/content/head/')
    make_sure_folder_exists(base_dir+'/pages/')

def make_sure_folder_exists(dir):
    if not os.path.exists(dir):
        os.makedirs(dir)


def main(argv):
    developer_mode = False
    gh_pages = True
    launch_webserver_on_compile = False

    try:
        opts, args = getopt.getopt(argv,"hd::",["dev=",])
    except getopt.GetoptError:
        print('Using default options')
    for opt, arg in opts:
        if opt == '-h':
            print('compilePages.py -hd')
            print('h: This help text')
            print('d: developer mode - skips minification')
            # print('')
            print('s: serve the compiled page after compilation')
            sys.exit()
        elif opt in ("-d", "--dev"):
            developer_mode = True
        elif opt in ("-s", "--serve"):
            launch_webserver_on_compile = True

    compile_pages_and_assets(developer_mode, gh_pages)

    if(launch_webserver_on_compile):
        launch_web_server(output_dir)

if __name__ == '__main__':
    main(sys.argv[1:])

# python -m http.server -d 'output'
