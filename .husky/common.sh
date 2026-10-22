command_exists () {
  command -v "$1" >/dev/null 2>&1
}

npm_command=npm
npx_command=npx
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*)
    npm_command=npm.cmd
    npx_command=npx.cmd
    ;;
esac

# Windows 10, Git Bash and Yarn workaround
if command_exists winpty && test -t 1; then
  exec < /dev/tty
fi
