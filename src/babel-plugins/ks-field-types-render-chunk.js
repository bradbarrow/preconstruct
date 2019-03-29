module.exports = function(babel) {
  const { types: t } = babel;
  let isPromiseResolve = t.buildMatchMemberExpression("Promise.resolve");
  return {
    visitor: {
      CallExpression(path) {
        // TODO: do this via import stuff
        if (path.get("callee").node.name !== "importView") {
          return;
        }
        let promiseResolveCall = path.get("arguments")[0];
        if (
          promiseResolveCall.isCallExpression() &&
          isPromiseResolve(promiseResolveCall.get("callee").node)
        ) {
          let requireCall = promiseResolveCall.get("arguments")[0];

          if (
            requireCall.isCallExpression() &&
            requireCall.get("callee").node.name === "require" &&
            requireCall.get("arguments")[0].isStringLiteral()
          ) {
            path.replaceWith(
              t.callExpression(
                // this should use path.join(__dirname, path) but that's for the real implementation
                t.memberExpression(
                  t.identifier("require"),
                  t.identifier("resolve")
                ),
                [requireCall.get("arguments")[0].node]
              )
            );
            return;
          }
        }
        throw new Error(
          "invalid importView usage, this is likely not a bug in user code"
        );
      }
    }
  };
};