Jekyll::Hooks.register :site, :after_reset do |site|
    puts "Running Webpack..."
    system("npx webpack")
  end