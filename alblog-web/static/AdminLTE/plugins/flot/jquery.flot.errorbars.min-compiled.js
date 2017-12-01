(function ($) {
  var options = { series: { points: { errorbars: null, xerr: { err: "x", show: null, asymmetric: null, upperCap: null, lowerCap: null, color: null, radius: null }, yerr: { err: "y", show: null, asymmetric: null, upperCap: null, lowerCap: null, color: null, radius: null } } } };function processRawData(plot, series, data, datapoints) {
    if (!series.points.errorbars) return;var format = [{ x: true, number: true, required: true }, { y: true, number: true, required: true }];var errors = series.points.errorbars;if (errors == "x" || errors == "xy") {
      if (series.points.xerr.asymmetric) {
        format.push({ x: true, number: true, required: true });format.push({ x: true, number: true, required: true });
      } else format.push({ x: true, number: true, required: true });
    }if (errors == "y" || errors == "xy") {
      if (series.points.yerr.asymmetric) {
        format.push({ y: true, number: true, required: true });format.push({ y: true, number: true, required: true });
      } else format.push({ y: true, number: true, required: true });
    }datapoints.format = format;
  }function parseErrors(series, i) {
    var points = series.datapoints.points;var exl = null,
        exu = null,
        eyl = null,
        eyu = null;var xerr = series.points.xerr,
        yerr = series.points.yerr;var eb = series.points.errorbars;if (eb == "x" || eb == "xy") {
      if (xerr.asymmetric) {
        exl = points[i + 2];exu = points[i + 3];if (eb == "xy") if (yerr.asymmetric) {
          eyl = points[i + 4];eyu = points[i + 5];
        } else eyl = points[i + 4];
      } else {
        exl = points[i + 2];if (eb == "xy") if (yerr.asymmetric) {
          eyl = points[i + 3];eyu = points[i + 4];
        } else eyl = points[i + 3];
      }
    } else if (eb == "y") if (yerr.asymmetric) {
      eyl = points[i + 2];eyu = points[i + 3];
    } else eyl = points[i + 2];if (exu == null) exu = exl;if (eyu == null) eyu = eyl;var errRanges = [exl, exu, eyl, eyu];if (!xerr.show) {
      errRanges[0] = null;errRanges[1] = null;
    }if (!yerr.show) {
      errRanges[2] = null;errRanges[3] = null;
    }return errRanges;
  }function drawSeriesErrors(plot, ctx, s) {
    var points = s.datapoints.points,
        ps = s.datapoints.pointsize,
        ax = [s.xaxis, s.yaxis],
        radius = s.points.radius,
        err = [s.points.xerr, s.points.yerr];var invertX = false;if (ax[0].p2c(ax[0].max) < ax[0].p2c(ax[0].min)) {
      invertX = true;var tmp = err[0].lowerCap;err[0].lowerCap = err[0].upperCap;err[0].upperCap = tmp;
    }var invertY = false;if (ax[1].p2c(ax[1].min) < ax[1].p2c(ax[1].max)) {
      invertY = true;var tmp = err[1].lowerCap;err[1].lowerCap = err[1].upperCap;err[1].upperCap = tmp;
    }for (var i = 0; i < s.datapoints.points.length; i += ps) {
      var errRanges = parseErrors(s, i);for (var e = 0; e < err.length; e++) {
        var minmax = [ax[e].min, ax[e].max];if (errRanges[e * err.length]) {
          var x = points[i],
              y = points[i + 1];var upper = [x, y][e] + errRanges[e * err.length + 1],
              lower = [x, y][e] - errRanges[e * err.length];if (err[e].err == "x") if (y > ax[1].max || y < ax[1].min || upper < ax[0].min || lower > ax[0].max) continue;if (err[e].err == "y") if (x > ax[0].max || x < ax[0].min || upper < ax[1].min || lower > ax[1].max) continue;var drawUpper = true,
              drawLower = true;if (upper > minmax[1]) {
            drawUpper = false;upper = minmax[1];
          }if (lower < minmax[0]) {
            drawLower = false;lower = minmax[0];
          }if (err[e].err == "x" && invertX || err[e].err == "y" && invertY) {
            var tmp = lower;lower = upper;upper = tmp;tmp = drawLower;drawLower = drawUpper;drawUpper = tmp;tmp = minmax[0];minmax[0] = minmax[1];minmax[1] = tmp;
          }x = ax[0].p2c(x), y = ax[1].p2c(y), upper = ax[e].p2c(upper);lower = ax[e].p2c(lower);minmax[0] = ax[e].p2c(minmax[0]);minmax[1] = ax[e].p2c(minmax[1]);var lw = err[e].lineWidth ? err[e].lineWidth : s.points.lineWidth,
              sw = s.points.shadowSize != null ? s.points.shadowSize : s.shadowSize;if (lw > 0 && sw > 0) {
            var w = sw / 2;ctx.lineWidth = w;ctx.strokeStyle = "rgba(0,0,0,0.1)";drawError(ctx, err[e], x, y, upper, lower, drawUpper, drawLower, radius, w + w / 2, minmax);ctx.strokeStyle = "rgba(0,0,0,0.2)";drawError(ctx, err[e], x, y, upper, lower, drawUpper, drawLower, radius, w / 2, minmax);
          }ctx.strokeStyle = err[e].color ? err[e].color : s.color;ctx.lineWidth = lw;drawError(ctx, err[e], x, y, upper, lower, drawUpper, drawLower, radius, 0, minmax);
        }
      }
    }
  }function drawError(ctx, err, x, y, upper, lower, drawUpper, drawLower, radius, offset, minmax) {
    y += offset;upper += offset;lower += offset;if (err.err == "x") {
      if (upper > x + radius) drawPath(ctx, [[upper, y], [Math.max(x + radius, minmax[0]), y]]);else drawUpper = false;if (lower < x - radius) drawPath(ctx, [[Math.min(x - radius, minmax[1]), y], [lower, y]]);else drawLower = false;
    } else {
      if (upper < y - radius) drawPath(ctx, [[x, upper], [x, Math.min(y - radius, minmax[0])]]);else drawUpper = false;if (lower > y + radius) drawPath(ctx, [[x, Math.max(y + radius, minmax[1])], [x, lower]]);else drawLower = false;
    }radius = err.radius != null ? err.radius : radius;if (drawUpper) {
      if (err.upperCap == "-") {
        if (err.err == "x") drawPath(ctx, [[upper, y - radius], [upper, y + radius]]);else drawPath(ctx, [[x - radius, upper], [x + radius, upper]]);
      } else if ($.isFunction(err.upperCap)) {
        if (err.err == "x") err.upperCap(ctx, upper, y, radius);else err.upperCap(ctx, x, upper, radius);
      }
    }if (drawLower) {
      if (err.lowerCap == "-") {
        if (err.err == "x") drawPath(ctx, [[lower, y - radius], [lower, y + radius]]);else drawPath(ctx, [[x - radius, lower], [x + radius, lower]]);
      } else if ($.isFunction(err.lowerCap)) {
        if (err.err == "x") err.lowerCap(ctx, lower, y, radius);else err.lowerCap(ctx, x, lower, radius);
      }
    }
  }function drawPath(ctx, pts) {
    ctx.beginPath();ctx.moveTo(pts[0][0], pts[0][1]);for (var p = 1; p < pts.length; p++) ctx.lineTo(pts[p][0], pts[p][1]);ctx.stroke();
  }function draw(plot, ctx) {
    var plotOffset = plot.getPlotOffset();ctx.save();ctx.translate(plotOffset.left, plotOffset.top);$.each(plot.getData(), function (i, s) {
      if (s.points.errorbars && (s.points.xerr.show || s.points.yerr.show)) drawSeriesErrors(plot, ctx, s);
    });ctx.restore();
  }function init(plot) {
    plot.hooks.processRawData.push(processRawData);plot.hooks.draw.push(draw);
  }$.plot.plugins.push({ init: init, options: options, name: "errorbars", version: "1.0" });
})(jQuery);

//# sourceMappingURL=jquery.flot.errorbars.min-compiled.js.map