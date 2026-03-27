# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_22
    pkgs.python3
  ];

  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "astro-build.astro-vscode"
    ];

    # Enable previews
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["bash" "-c" "npm install --ignore-scripts && npm run dev -- --port $PORT --host 0.0.0.0"];
          manager = "web";
        };
      };
    };

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        npm-install = "npm install --ignore-scripts";
        db-migrate = "npm run db:migrate:local";
      };
      # Runs when the workspace is (re)started
      onStart = {
        npm-install = "npm install --ignore-scripts";
      };
    };
  };
}
