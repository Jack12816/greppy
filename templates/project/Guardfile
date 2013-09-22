# A sample Guardfile for Greppy projects
# More info at https://github.com/guard/guard#readme

guard 'livereload' do

    # Module views
    watch(%r{modules/.+/resources/views/.+\.(jade|haml|ejs)$})

    # Module assets
    watch(%r{modules/(.+)/resources/public/(.+\.(js|css|png))$}) { |m|
        "/modules/#{m[1]}/#{m[2]}"
    }

    # Application public assets
    watch(%r{public/.+\.(css|js|html)})
end

guard 'shell' do

    # Reload all running contexts if a js file changes
    watch(%r{(app|modules)/.+\.js$}) { |m| `greppy -e` }

    # Check all javascript file for syntax errors
    watch /.*\.js$/ do |m|
        if `jshint #{m[0]}`.empty?
            n "#{m[0]} is correct", 'JavaScript Syntax', :success
        else
            n "#{m[0]} is incorrect", 'JavaScript Syntax', :failed
        end
    end
end

