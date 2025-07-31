task :start do
    Dir.chdir('src/_site') do
        system('npx browser-sync start --server --files "." --no-ui --reload-delay 500 --reload-debounce 500')
    end
end

task :watch do 
    Dir.chdir('src/') do
        system('npx elmstatic watch')
    end
end